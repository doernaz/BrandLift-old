
import { vpsDeployService } from './services/vpsDeployService.ts';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testWpProvision() {
    console.log("Starting WordPress Provisioning Test...");
    // Use a unique subdomain for the test
    const domain = `wp-demo.${process.env.VPS_HOST}.nip.io`;

    try {
        const url = await vpsDeployService.deployWordPress(domain, "BrandLift WP Demo");
        console.log("---------------------------------------------------");
        console.log(`SUCCESS! WordPress Site Provisioned: ${url}`);
        console.log("---------------------------------------------------");
    } catch (e) {
        console.error("Provisioning Failed:", e);
    }
}

testWpProvision();
