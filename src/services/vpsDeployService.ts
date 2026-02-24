import { Client } from 'ssh2';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const VPS_HOST = process.env.VPS_HOST;
const VPS_USER = process.env.VPS_USER;
const VPS_PASS = process.env.VPS_PASS;

if (!VPS_HOST || !VPS_USER || !VPS_PASS) {
    throw new Error("Missing VPS Credentials in .env.local");
}

export class VpsDeployService {

    private getClient(): Promise<Client> {
        return new Promise((resolve, reject) => {
            const conn = new Client();
            conn.on('ready', () => resolve(conn))
                .on('error', (err) => reject(err))
                .connect({
                    host: VPS_HOST,
                    port: 22,
                    username: VPS_USER,
                    password: VPS_PASS,
                    readyTimeout: 20000,
                });
        });
    }

    private exec(conn: Client, command: string): Promise<string> {
        return new Promise((resolve, reject) => {
            conn.exec(command, (err, stream) => {
                if (err) return reject(err);

                let output = '';
                let errorOutput = '';

                stream.on('close', (code: any, signal: any) => {
                    if (code !== 0) {
                        reject(new Error(`Command failed with code ${code}: ${errorOutput} | ${output}`));
                    } else {
                        resolve(output);
                    }
                }).on('data', (data: any) => {
                    output += data;
                }).stderr.on('data', (data: any) => {
                    errorOutput += data;
                });
            });
        });
    }

    /**
     * One-time setup: Installs Nginx and creates directories.
     */
    async bootstrapServer() {
        console.log("Bootstrapping VPS at " + VPS_HOST);
        const conn = await this.getClient();
        try {
            // Check OS (AlmaLinux uses dnf/yum)
            const osRelease = await this.exec(conn, 'cat /etc/os-release');
            const isRedHat = osRelease.includes('AlmaLinux') || osRelease.includes('CentOS') || osRelease.includes('Fedora');

            if (isRedHat) {
                console.log("Detected RHEL/AlmaLinux. Installing LEMP Stack...");
                await this.exec(conn, 'dnf update -y');
                await this.exec(conn, 'dnf install nginx php php-fpm php-mysqlnd php-json php-mbstring php-xml php-gd mariadb-server -y');
                await this.exec(conn, 'systemctl enable --now nginx php-fpm mariadb');

                // Secure MariaDB (Simple)
                // In production, run mysql_secure_installation interactively

                // Install WP-CLI
                await this.exec(conn, 'curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar');
                await this.exec(conn, 'chmod +x wp-cli.phar');
                await this.exec(conn, 'mv wp-cli.phar /usr/local/bin/wp');

                try {
                    await this.exec(conn, 'firewall-cmd --permanent --add-service=http');
                    await this.exec(conn, 'firewall-cmd --permanent --add-service=https');
                    await this.exec(conn, 'firewall-cmd --reload');
                } catch (fwErr) {
                    console.log("Firewall config skipped or failed:", fwErr);
                }
            } else {
                console.log("Detected Debian/Ubuntu. Installing LEMP Stack...");
                await this.exec(conn, 'apt-get update -y');
                await this.exec(conn, 'apt-get install nginx php-fpm php-mysql php-xml php-mbstring mariadb-server -y');
                // Install WP-CLI
                await this.exec(conn, 'curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar');
                await this.exec(conn, 'chmod +x wp-cli.phar');
                await this.exec(conn, 'mv wp-cli.phar /usr/local/bin/wp');
            }

            // Create base directory for sites
            await this.exec(conn, 'mkdir -p /var/www/brandlift_sites');

            // Fix permissions
            await this.exec(conn, 'chown -R nginx:nginx /var/www/brandlift_sites || chown -R www-data:www-data /var/www/brandlift_sites');
            await this.exec(conn, 'chmod -R 755 /var/www/brandlift_sites');

            console.log("Bootstrap complete. Nginx is running.");
        } catch (err) {
            console.error("Bootstrap failed:", err);
            throw err;
        } finally {
            conn.end();
        }
    }

    /**
     * Deploys a static site to the VPS.
     * 1. Creates a directory for the domain.
     * 2. Uploads index.html.
     * 3. Configures Nginx virtual host.
     * 4. Reloads Nginx.
     */
    async deploySite(domain: string, htmlContent: string) {
        console.log(`Deploying site: ${domain} to VPS...`);
        const conn = await this.getClient();
        try {
            const safeDomain = domain.replace(/[^a-z0-9.-]/g, '');
            const docRoot = `/var/www/brandlift_sites/${safeDomain}`;

            // 1. Create Directory
            await this.exec(conn, `mkdir -p ${docRoot}`);

            // 2. Write HTML File (escaping quotes for echo)
            // Using base64 to avoid shell escaping issues with complex HTML
            const base64Html = Buffer.from(htmlContent).toString('base64');
            await this.exec(conn, `echo "${base64Html}" | base64 -d > ${docRoot}/index.html`);

            // 3. Nginx Config
            // Note: On AlmaLinux/CentOS, default config dir is usually /etc/nginx/conf.d/
            const confPath = `/etc/nginx/conf.d/${safeDomain}.conf`;
            const nginxConfig = `
server {
    listen 80;
    server_name ${safeDomain} *.${safeDomain};
    root ${docRoot};
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
`;
            const base64Conf = Buffer.from(nginxConfig).toString('base64');
            await this.exec(conn, `echo "${base64Conf}" | base64 -d > ${confPath}`);

            // 4. Test & Reload Nginx
            await this.exec(conn, 'nginx -t && systemctl reload nginx');

            console.log(`Successfully deployed ${domain}!`);
            return `http://${VPS_HOST}`; // Return IP access for now since DNS won't propagate instantly
        } catch (err) {
            console.error(`Deploy failed for ${domain}:`, err);
            throw err;
        } finally {
            conn.end();
        }
    }
    async deployWordPress(domain: string, title: string, content?: string) {
        console.log(`Deploying WordPress site: ${domain}...`);
        const conn = await this.getClient();
        try {
            const safeDomain = domain.replace(/[^a-z0-9.-]/g, '');
            const docRoot = `/var/www/brandlift_sites/${safeDomain}`;
            const dbName = safeDomain.replace(/[\.-]/g, '_').substring(0, 60);
            const dbUser = 'u_' + Math.random().toString(36).slice(-8); // Unique user per site
            const dbPass = Math.random().toString(36).slice(-10) + 'X!'; // Stronger, random pass

            // 1. Create Database & User
            // Split into separate commands to avoid complex shell quoting issues
            await this.exec(conn, `mysql -e "CREATE DATABASE IF NOT EXISTS ${dbName};"`);
            await this.exec(conn, `mysql -e "CREATE USER '${dbUser}'@'localhost' IDENTIFIED BY '${dbPass}';"`);
            await this.exec(conn, `mysql -e "GRANT ALL PRIVILEGES ON ${dbName}.* TO '${dbUser}'@'localhost';"`);
            await this.exec(conn, `mysql -e "FLUSH PRIVILEGES;"`);

            // 2. Setup Directory
            await this.exec(conn, `mkdir -p ${docRoot}`);

            // 3. Download WordPress
            try {
                await this.exec(conn, `test -f ${docRoot}/wp-config.php`);
            } catch {
                await this.exec(conn, `/usr/local/bin/wp core download --path=${docRoot} --allow-root --force`);
                await this.exec(conn, `/usr/local/bin/wp config create --dbname=${dbName} --dbuser=${dbUser} --dbpass=${dbPass} --path=${docRoot} --allow-root`);
                await this.exec(conn, `/usr/local/bin/wp core install --url="http://${domain}" --title="${title}" --admin_user="brandlift" --admin_password="password123" --admin_email="admin@${safeDomain}" --path=${docRoot} --allow-root`);

                // 5. Apply "Blueprint" (Theme & Plugins)
                console.log("Applying BrandLift Blueprint (Theme & Plugins)...");
                await this.exec(conn, `/usr/local/bin/wp theme install astra --activate --path=${docRoot} --allow-root`);
                await this.exec(conn, `/usr/local/bin/wp plugin install elementor --activate --path=${docRoot} --allow-root`);
                await this.exec(conn, `/usr/local/bin/wp option update blogdescription "Optimized by BrandLift" --path=${docRoot} --allow-root`);

            }

            // 6. Inject Generated Content (Always update content on deploy)
            if (content && content.length > 0) {
                console.log("Injecting Generated Content...");
                // Upload Content to file
                await this.exec(conn, `echo "${Buffer.from(content).toString('base64')}" | base64 -d > ${docRoot}/home_content.html`);

                // Create Import Script (Using PHP to avoid shell escaping issues)
                // Use 'post_name' to find existing page to update, or create new.
                const importScript = `<?php
                $content = file_get_contents('${docRoot}/home_content.html');
                
                // Check if Home page exists
                $page = get_page_by_path('home', OBJECT, 'page');
                
                if ($page) {
                    // Update existing
                    $id = wp_update_post([
                        'ID'           => $page->ID,
                        'post_content' => $content,
                        'post_status'  => 'publish'
                    ]);
                    $action = "Updated";
                } else {
                    // Create new
                    $id = wp_insert_post([
                        'post_title'    => 'Home',
                        'post_name'     => 'home',
                        'post_content'  => $content,
                        'post_status'   => 'publish',
                        'post_type'     => 'page',
                        'comment_status'=> 'closed'
                    ]);
                    $action = "Created";
                }

                if ($id && !is_wp_error($id)) {
                    update_option('show_on_front', 'page');
                    update_option('page_on_front', $id);
                    echo "Success: $action Home Page ID $id";
                } else {
                    echo "Error: Failed to process page";
                }
                ?>`;

                const scriptPath = `${docRoot}/install_content.php`;
                await this.exec(conn, `echo "${Buffer.from(importScript).toString('base64')}" | base64 -d > ${scriptPath}`);

                // Execute Script
                const importOut = await this.exec(conn, `/usr/local/bin/wp eval-file ${scriptPath} --path=${docRoot} --allow-root`);
                console.log(`[Content Injection] ${importOut}`);

                // Cleanup
                await this.exec(conn, `rm ${docRoot}/home_content.html ${scriptPath}`);
            }

            // 4. Nginx Config
            const confPath = `/etc/nginx/conf.d/${safeDomain}.conf`;
            const nginxConfig = `server {
    listen 80;
    server_name ${safeDomain} *.${safeDomain};
    root ${docRoot};
    index index.php index.html;
    location / { try_files $uri $uri/ /index.php?$args; }
    location ~ \\.php$ {
        include fastcgi_params;
        fastcgi_pass unix:/run/php-fpm/www.sock; 
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }
}`;
            await this.exec(conn, `echo "${Buffer.from(nginxConfig).toString('base64')}" | base64 -d > ${confPath}`);

            // 5. Permissions
            let phpUser = 'apache'; // Default fallback for RHEL/CentOS
            try {
                // Dynamically detect the user running the PHP-FPM pool (excluding root/master)
                const detectedUser = await this.exec(conn, "ps aux | grep 'php-fpm: pool' | grep -v grep | head -1 | awk '{print $1}'");
                if (detectedUser && detectedUser.trim().length > 0) {
                    phpUser = detectedUser.trim();
                    console.log(`[VPS] Detected PHP-FPM User: ${phpUser}`);
                }
            } catch (e) {
                console.warn("[VPS] Failed to detect PHP user, using fallback:", e);
            }

            // Set ownership to the PHP user so it can read/execute scripts
            await this.exec(conn, `chown -R ${phpUser}:${phpUser} ${docRoot}`);

            // Allow Nginx (group/other) to traverse and read
            await this.exec(conn, `chmod 755 /var/www/brandlift_sites`);
            await this.exec(conn, `chmod -R 755 ${docRoot}`);

            // SELinux Fix (essential for RHEL/CentOS)
            await this.exec(conn, `chcon -R -t httpd_sys_content_t ${docRoot} || true`);

            // Fix server_names_hash_bucket_size (common issue with long domains)
            // Create a drop-in config to handle this safely
            await this.exec(conn, `echo "server_names_hash_bucket_size 128;" > /etc/nginx/conf.d/000-hash-bucket.conf`);

            await this.exec(conn, 'nginx -t && systemctl reload nginx');

            return `http://${domain}`;
        } catch (err) {
            console.error(`WP Deploy failed for ${domain}:`, err);
            throw err;
        } finally {
            conn.end();
        }
    }

    private getHost() { return VPS_HOST; }
}

import { fileURLToPath } from 'url';

// Singleton export
export const vpsDeployService = new VpsDeployService();

// Run bootstrap if called directly
// @ts-ignore
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    (async () => {
        try {
            await vpsDeployService.bootstrapServer();
        } catch (e) {
            console.error("Bootstrap Error:", e);
        }
    })();
}
