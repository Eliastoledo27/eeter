'use server';

import { checkUserPermissions } from '@/utils/supabase/middleware-auth';
import { exec } from 'child_process';
import path from 'path';

export async function generateProductVideoAction(productId?: string) {
    const { user, isAdmin, isStaff } = await checkUserPermissions();

    if (!user || (!isAdmin && !isStaff)) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        const scriptPath = path.join(process.cwd(), 'scripts', 'hyperframes-product-plugin.mjs');
        const cmd = productId ? `node ${scriptPath} ${productId}` : `node ${scriptPath}`;
        
        // Spawn the script in the background
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error generating video: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`Video generation stderr: ${stderr}`);
                return;
            }
            console.log(`Video generation stdout: ${stdout}`);
        });

        return { success: true, message: 'Video generation job started in background' };
    } catch (e: any) {
        return { success: false, error: e.message || 'Failed to start video generation' };
    }
}
