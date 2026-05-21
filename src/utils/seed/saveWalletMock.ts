import { WALLET_MOCK } from "../../data/walletMock";
import { WalletService } from "../../services/wallet.service";
import { ValidationError } from "../appError";

export const saveWalletMock = async (userId: string) => {
  const walletService = new WalletService();

  if (!userId) throw new ValidationError('userId is required');

  const wallets = WALLET_MOCK.map(async (w) => (
    await walletService.create({
      name: w.name,
      balance: w.balance,
      type: w.type,
      color: w.color,
      income: w.income,
      expense: w.expense,
      initBalance: w.initBalance,
      incomeCount: w.incomeCount,
      expenseCount: w.expenseCount,
      userId
    })
  ));

  await Promise.all(wallets);

  return {
    message: 'wallets saved'
  }
}