import dotenv from 'dotenv'
import autoSwapSonicLabs from './src/sonictestnet/swap.js'
import Web3 from 'web3'

dotenv.config()

let wallets = process.env.PRIVATE_KEYS.split(","); // Danh sách khóa riêng tư, phân tách bằng dấu phẩy
const minCount = 25; // Số giao dịch tối thiểu cho mỗi ví
const maxCount = 70; // Số giao dịch tối đa cho mỗi ví

// Hàm tạo số ngẫu nhiên trong khoảng [minCount, maxCount]
const getRandomCount = () => Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;

// Hàm thực hiện giao dịch cho một ví
const processWallet = async (priv, walletIndex) => {
  const web3 = new Web3('https://rpc.blaze.soniclabs.com');
  const account = web3.eth.accounts.privateKeyToAccount(priv);
  web3.eth.accounts.wallet.add(account);

  let count = 0;
  const dailyLimit = getRandomCount();
  console.log(`Ví ${walletIndex + 1}: Số giao dịch cần thực hiện: ${dailyLimit}`);

  const executeTransactions = async () => {
    if (count < dailyLimit) {
      try {
        const getSonic = await autoSwapSonicLabs(priv);
        console.log(`Ví ${walletIndex + 1}: Giao dịch thành công: https://blaze.soniclabs.com/address/${getSonic.logs[0].transactionHash}`);
        count++;
      } catch (error) {
        // Bỏ qua ví này mà không in log lỗi
        return;
      }
    } else {
      console.log(`Ví ${walletIndex + 1}: Đã hoàn thành số lượng giao dịch.`);
      return; // Dừng lặp cho ví này
    }

    setTimeout(executeTransactions, 5000); // Gọi lại sau 5 giây
  };

  executeTransactions(); // Bắt đầu thực hiện giao dịch
}

// Lặp qua tất cả các ví
wallets.forEach((priv, index) => {
  processWallet(priv, index);
});
