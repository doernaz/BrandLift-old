
import { vpsDeployService } from '../services/vpsDeployService';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testWpProvision() {
    console.log("Starting WordPress Provisioning Test...");
    const domain = `wp-test-v1.${process.env.VPS_HOST}.nip.io`;
    // Using nip.io to resolve to the VPS IP for immediate access

    try {
        const url = await vpsDeployService.deployWordPress(domain, "BrandLift WP Demo");
        console.log("---------------------------------------------------");
        console.log(`SUCCESS! WordPress Site Provisioned: http://${domain}`);
        console.log("---------------------------------------------------");
    } catch (e) {
        console.error("Provisioning Failed:", e);
    }
}

testWpProvision();
