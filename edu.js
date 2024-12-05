import dotenv from 'dotenv';
import chalk from 'chalk';
import swapEdu from './src/eduChain/swap.js';
import ora from 'ora';
import Pumper from './src/eduChain/pumper.js';
import trusPad from './src/eduChain/trustPad.js';

dotenv.config();
let count = 0;
const maxCount = 3;
const resetInterval = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Kiểm tra và xử lý PRIVATE_KEYS từ .env
const keys = process.env.PRIVATE_KEYS ? process.env.PRIVATE_KEYS.split(',') : [];
if (keys.length === 0) {
    console.log(chalk.red('No private keys found in the .env file.'));
    process.exit(1); // Dừng chương trình nếu không có private keys
}

// Countdown function
const countdown = (time, isReset = false) => {
    const spinner = ora({
        text: chalk.cyan(`${isReset ? 'Reset in ' : 'Next run in '} ${time} seconds`),
        spinner: 'bouncingBall',
    }).start();

    let timer = time;
    let intervalId = setInterval(() => {
        spinner.text = chalk.cyan(`${isReset ? 'Reset in ' : 'Next run in '} ${timer} seconds`);
        timer--;
        if (timer <= 0) {
            spinner.stop();
            clearInterval(intervalId);
            if (isReset) {
                console.log(chalk.green("\nDaily sudah ready, waktunya bekerja!"));
            }
        }
    }, 1000);
};

// Reset count every 24 hours
setInterval(() => {
    count = 0;
}, resetInterval);

const main = async (priv) => {
    if (count < maxCount) {
        try {
            const getTruspad = await trusPad(priv);
            const getEdu = await swapEdu(priv);
            const getPumper = await Pumper(priv);
            console.log(chalk.green(`Successfully swap from dapps https://eduswap.github.io/webapp/ , txhash :  https://opencampus-codex.blockscout.com/tx/${getEdu.logs[0].transactionHash}`));
            console.log(chalk.green(`Successfully Create Token from dapps https://www.pumper.lol/ , txhash :  https://opencampus-codex.blockscout.com/tx/${getPumper.logs[0].transactionHash}`));
            console.log(chalk.yellow(`Successfully Create Token from dapps and Lauch from https://www.thrustpad.finance/`));
            console.log(chalk.yellow(`Token Name : ${getTruspad.contractName}`));
            console.log(chalk.yellow(`Token Symbol : ${getTruspad.contractSymbol}`));
            console.log(chalk.yellow(`Token Address : ${getTruspad.contractAddress}`));
            console.log(chalk.yellow(`tx Hash : https://opencampus-codex.blockscout.com/tx/${getTruspad.receipt}`));
            count++;
            countdown(maxCount - count);
        } catch (error) {
            console.log(chalk.red(error));
        }
    } else {
        console.log(chalk.yellow("Sudah selesai daily nya, tunggu reset..."));
        countdown(resetInterval / 1000, true); // Start countdown for 24 hours
    }

    setTimeout(() => main(priv), 60000); // Call again after 10 minutes
};

const mainForAllKeys = async () => {
    for (const priv of keys) {
        try {
            console.log(chalk.blue(`\nStarting for wallet: ${priv.slice(0, 6)}...`));
            await main(priv);
        } catch (error) {
            console.log(chalk.red(`Error with wallet ${priv.slice(0, 6)}:`, error.message));
        }
    }
};

// Gọi mainForAllKeys để xử lý tất cả các private key
mainForAllKeys();
