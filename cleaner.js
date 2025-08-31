#!/usr/bin/env node

// A CLI tool to automatically organize the Downloads folder.

import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import * as clack from '@clack/prompts';
import ora from 'ora';
import figlet from 'figlet';
import chalk from 'chalk';

// Path to the Downloads directory
const downloadsDir = path.join(os.homedir(), 'Downloads');

// How files will be categorized based on extension
// Feel free to add or remove extensions and categories!
const categories = {
    Images: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp'],
    Documents: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.rtf', '.csv'],
    Archives: ['.zip', '.rar', '.7z', '.tar', '.gz'],
    Audio: ['.mp3', '.wav', '.aac', '.flac', '.ogg'],
    Video: ['.mp4', '.mov', '.avi', '.mkv', '.wmv'],
    Code: ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.c', '.cpp', '.h', '.html', '.css', '.json', '.xml', '.yml', '.yaml', '.sh', '.bash', '.md'],
    Other: [] // A fallback category
};

async function cleanDownloads(isDryRun = false) {
    clack.log.info(chalk.gray('Starting file organization...')); // Added start message
    const spinner = ora({ text: chalk.gray('Scanning files...'), spinner: 'arc' }).start();

    const fileNames = await fs.readdir(downloadsDir);
    
    spinner.succeed(chalk.whiteBright(`Scanned ${fileNames.length} items.`));
    await new Promise(resolve => setTimeout(resolve, 2000)); // Added delay

    spinner.text = chalk.gray('Organizing files...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Added delay

    for (const fileName of fileNames) {
       
        spinner.text = chalk.gray(`Processing: ${fileName}`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Added delay

        const fullPath = path.join(downloadsDir, fileName);
        const stats = await fs.stat(fullPath);

        if (stats.isFile()) {
         
            const extension = path.extname(fullPath).toLowerCase();
            let foundCategory = null;

            for (const category in categories) {
                if (categories[category].includes(extension)) {
                    foundCategory = category;
                    break;
                }
            }

            if (!foundCategory) {
                foundCategory = 'Other';
            }

            const destDir = path.join(downloadsDir, foundCategory);
            
            if (!isDryRun) {
            spinner.text = chalk.gray(`Ensuring category folder for ${foundCategory}...`); // Fixed typo: categroy -> category
            await new Promise(resolve => setTimeout(resolve, 2000)); // Added delay
            try {
                await fs.mkdir(destDir);
                spinner.stop(); // Added
                clack.log.info(chalk.whiteBright(`Folder created: ${foundCategory}/
`));
                spinner.start(); // Added
            } catch (error) {
                if (error.code !== 'EEXIST') {
                    throw error;
                } else {
                    spinner.stop(); // Added
                    clack.log.info(chalk.whiteBright(`Folder already exists: ${foundCategory}/
`));
                    spinner.start(); // Added
                }
            }
            }

            const newPath = path.join(destDir, fileName);

            if (!isDryRun) {
            spinner.text = chalk.gray(`Moving ${fileName} to ${foundCategory}/...`);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Added delay
            await fs.rename(fullPath, newPath);
            spinner.stop(); // Added
            clack.log.success(chalk.greenBright(`Moved: ${fileName} --> ${foundCategory}/
`));
            spinner.start(); // Added
        } else {
            spinner.stop(); // Added
            clack.log.info(chalk.bgBlack.redBright(`[DRY RUN] Would move ${fileName} to ${foundCategory}/
`));
            spinner.start(); // Added
        }
    }
}

    spinner.succeed(chalk.whiteBright('All files organized!'));
    clack.log.success(chalk.whiteBright('Your Downloads folder has been cleaned!')); // Added final success message
}

// --- Script Entry Point ---
async function main() {
    console.log(chalk.gray(await figlet('Download\nCleaner', { font: 'ANSI Shadow' })));

    const isDryRun = process.argv.includes('--dry-run');


    clack.intro(chalk.gray(' Starting the cleaning process... '));

    await cleanDownloads(isDryRun);

    clack.outro(chalk.gray(' Cleaning process finished. '));
}

main().catch(error => {
    clack.log.error('An unexpected error occurred:');
    console.error(error);
    process.exit(1);
});