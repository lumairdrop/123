import Web3 from "web3";

const autoSwapSonicLabs = async (priv) => {
    const web3 = new Web3('https://rpc.blaze.soniclabs.com');
    const account = web3.eth.accounts.privateKeyToAccount(priv);
    web3.eth.accounts.wallet.add(account);

    const contract = "0x086d426f8b653b88a2d6d03051c8b4ab8783be2b";

    // Danh sách dữ liệu (chỉ có 2 dòng)
    const dataList = [
        '0xddba27a700000000000000000000000000000000000000000000000000005af3107a4000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000002000000000000000000000000af93888cbd250300470a1618206e036e1147014900000000000000000000000050971f8978c431d560ff658a83a8a03fdf1990550000000000000000000000000000000000000000000000000000000000000001000000000000000000000000f88e70b3e1f848c55781297329093e8b15969908',
        '0xddba27a700000000000000000000000000000000000000000000000000005af3107a4000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000002000000000000000000000000af93888cbd250300470a1618206e036e1147014900000000000000000000000030bf3761147ef0c86e2f84c3784fbd89e79546700000000000000000000000000000000000000000000000000000000000000001000000000000000000000000908562f2aca4d9bd0370fc7bd0d2fdf59395082c'
    ];

    // Kiểm tra nếu dataList có dữ liệu
    if (dataList.length === 0) {
        console.error('Không có dữ liệu trong dataList');
        return;
    }

    let i = 0; // Biến đếm giao dịch

    // Lặp qua danh sách dữ liệu vô hạn (lặp lại khi đến cuối)
    while (true) {
        const data = dataList[i % dataList.length]; // Lấy dữ liệu theo chỉ số % số phần tử trong dataList

        try {
            // 1. Ước tính gas cần thiết cho giao dịch
            const gasEstimate = await web3.eth.estimateGas({
                from: account.address,
                to: contract,
                data: data
            });

            // 2. Điều chỉnh gas limit
            const adjustedGasLimit = Math.round(Number(gasEstimate) * 1.2);

            // 3. Lấy giá gas hiện tại và điều chỉnh
            let gasPrice = await web3.eth.getGasPrice();
            gasPrice = Number(gasPrice);

            // 4. Cấu hình giao dịch
            const tx = {
                from: account.address,
                to: contract,
                data: data,
                gas: adjustedGasLimit,
                gasPrice: gasPrice * 2 // Tăng gas price gấp đôi
            };

            // 5. Ký và gửi giao dịch
            const signedTx = await web3.eth.accounts.signTransaction(tx, priv);
            const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
            console.log(`Dòng data ${i + 1}: Giao dịch thành công! Hash: https://testnet.soniclabs.com/tx/${receipt.transactionHash}`);
        } catch (error) {
            // Bỏ qua lỗi mà không in ra log
            return;
        }

        // Delay 5 giây giữa các giao dịch
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Tăng chỉ số giao dịch
        i++;
    }
};

export default autoSwapSonicLabs;
