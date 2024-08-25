"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sell = exports.processOpenBookMarket = exports.checkMintable = exports.processRaydiumPool = void 0;
var raydium_sdk_1 = require("@raydium-io/raydium-sdk");
var spl_token_1 = require("@solana/spl-token");
var web3_js_1 = require("@solana/web3.js");
var liquidity_1 = require("./liquidity");
var utils_1 = require("./utils");
var market_1 = require("./market");
var types_1 = require("./types");
var bs58_1 = __importDefault(require("bs58"));
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var readline_1 = __importDefault(require("readline"));
var constants_1 = require("./constants");
var bn_js_1 = require("bn.js");
var tokenFilter_1 = require("./tokenFilter");
var jito_1 = require("./executor/jito");
var legacy_1 = require("./executor/legacy");
var jitoWithAxios_1 = require("./executor/jitoWithAxios");
var solanaConnection = new web3_js_1.Connection(constants_1.RPC_ENDPOINT, {
    wsEndpoint: constants_1.RPC_WEBSOCKET_ENDPOINT,
});
var rl = readline_1.default.createInterface({
    input: process.stdin,
    output: process.stdout
});
var existingLiquidityPools = new Set();
var existingOpenBookMarkets = new Set();
var existingTokenAccounts = new Map();
var wallet;
var quoteToken;
var quoteTokenAssociatedAddress;
var quoteAmount;
var quoteMinPoolSizeAmount;
var quoteMaxPoolSizeAmount;
var processingToken = false;
var poolId;
var tokenAccountInCommon;
var accountDataInCommon;
var idDealt = spl_token_1.NATIVE_MINT.toBase58();
var snipeList = [];
var timesChecked = 0;
var soldSome = false;
var RESET = "\u001b[0m";
var RED = "\u001b[31m";
var YELLOW = "\u001b[33m";
var GREEN = "\u001b[32m";
var BLUE = '\u001b[36m';
function init() {
    return __awaiter(this, void 0, void 0, function () {
        var solBalance, wsolBalance, tokenAccounts, _i, tokenAccounts_1, ta;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log(BLUE, '               LAUNCHING' + RESET);
                    return [4 /*yield*/, sleep(500)];
                case 1:
                    _a.sent();
                    console.log(BLUE, '       ██████████████████████████' + RESET);
                    return [4 /*yield*/, sleep(500)];
                case 2:
                    _a.sent();
                    console.log(BLUE, '       █─▄▄▄▄█─▄▄─█▄─▄█████▄─▀─▄█' + RESET);
                    return [4 /*yield*/, sleep(500)];
                case 3:
                    _a.sent();
                    console.log(BLUE, '       █▄▄▄▄─█─██─██─██▀████▀─▀██' + RESET);
                    return [4 /*yield*/, sleep(500)];
                case 4:
                    _a.sent();
                    console.log(BLUE, '       ▀▄▄▄▄▄▀▄▄▄▄▀▄▄▄▄▄▀▀▀▄▄█▄▄▀' + RESET);
                    return [4 /*yield*/, sleep(500)];
                case 5:
                    _a.sent();
                    console.log(BLUE, '       Solana Frontrunning Sniper' + RESET);
                    return [4 /*yield*/, sleep(500)];
                case 6:
                    _a.sent();
                    console.log(BLUE, '               BY DEFIX' + RESET);
                    return [4 /*yield*/, sleep(500)];
                case 7:
                    _a.sent();
                    console.log("");
                    console.log("");
                    console.log(YELLOW + "       Limited opportunities are being displayed" + RESET)
                    console.log(YELLOW + "because you are on a Free version, limiting profitability" + RESET)
                    utils_1.logger.level = constants_1.LOG_LEVEL;
                    // get wallet
                    wallet = web3_js_1.Keypair.fromSecretKey(bs58_1.default.decode(constants_1.PRIVATE_KEY));
                    return [4 /*yield*/, solanaConnection.getBalance(wallet.publicKey)];
                case 8:
                    solBalance = _a.sent();
                    return [4 /*yield*/, (0, spl_token_1.getAssociatedTokenAddress)(spl_token_1.NATIVE_MINT, wallet.publicKey)];
                case 9:
                    quoteTokenAssociatedAddress = _a.sent();
                    return [4 /*yield*/, solanaConnection.getBalance(quoteTokenAssociatedAddress)];
                case 10:
                    wsolBalance = _a.sent();
                    console.log('');
                    console.log(BLUE, "---------------------------------------------------------------" + RESET);
                    console.log('');
                    console.log(" Wallet Address: ".concat(wallet.publicKey));
                    console.log(" SOL balance: ".concat((solBalance / Math.pow(10, 9)).toFixed(3), " SOL - WSOL Balance: ").concat((wsolBalance / Math.pow(10, 9)).toFixed(3)));
                    // get quote mint and amount
                    (0, liquidity_1.processPool)();
                    switch (constants_1.QUOTE_MINT) {
                        case 'WSOL': {
                            quoteToken = raydium_sdk_1.Token.WSOL;
                            quoteAmount = new raydium_sdk_1.TokenAmount(raydium_sdk_1.Token.WSOL, constants_1.QUOTE_AMOUNT, false);
                            quoteMinPoolSizeAmount = new raydium_sdk_1.TokenAmount(quoteToken, constants_1.MIN_POOL_SIZE, false);
                            quoteMaxPoolSizeAmount = new raydium_sdk_1.TokenAmount(quoteToken, constants_1.MAX_POOL_SIZE, false);
                            break;
                        }
                        default: {
                            throw new Error("Unsupported quote mint \"".concat(constants_1.QUOTE_MINT, "\". Supported values are USDC and WSOL"));
                        }
                    }
                    console.log('');
                    console.log(BLUE, "---------------------------------------------------------------" + RESET);
                    console.log('');
                    console.log(" Automatic Sniping Mode: " + RED + "OFF" + RESET + "(" + YELLOW + "PREMIUM" + RESET + ")");
                    console.log(" Minimum Pool Size: ".concat(quoteMinPoolSizeAmount.isZero() ? 'false' : quoteMinPoolSizeAmount.toFixed(2), " ").concat(quoteToken.symbol));
                    console.log(" Maximum Pool Size: ".concat(quoteMaxPoolSizeAmount.isZero() ? 'false' : quoteMaxPoolSizeAmount.toFixed(2), " ").concat(quoteToken.symbol));
                    console.log(" Snipe Multiple Tokens At A Time: " + RED + "OFF" + RESET + "(" + YELLOW + "PREMIUM" + RESET + ")");
                    console.log(" Amount Of SOL To Snipe With: ".concat(quoteAmount.toFixed(6), " ").concat(quoteToken.symbol));
                    return [4 /*yield*/, (0, liquidity_1.getTokenAccounts)(solanaConnection, wallet.publicKey, constants_1.COMMITMENT_LEVEL)];
                case 11:
                    tokenAccounts = _a.sent();
                    for (_i = 0, tokenAccounts_1 = tokenAccounts; _i < tokenAccounts_1.length; _i++) {
                        ta = tokenAccounts_1[_i];
                        existingTokenAccounts.set(ta.accountInfo.mint.toString(), {
                            mint: ta.accountInfo.mint,
                            address: ta.pubkey,
                        });
                    }
                    console.log('');
                    console.log(BLUE, "------------------- TAKE PROFIT LEVELS ------------------------" + RESET);
                    console.log('');
                    console.log(" Take Profit Level 1: ".concat(constants_1.TAKE_PROFIT1, "%"));
                    console.log(" Take Profit Level 2: " + RED + "OFF" + RESET + "(" + YELLOW + "PREMIUM" + RESET + ")");
                    console.log('');
                    console.log(BLUE, "------------------- CHECKS AND ANALYSIS -----------------------" + RESET);
                    console.log('');
                    console.log(" Check If Token Has Socials And Website: " + RED + "OFF" + RESET + "(" + YELLOW + "PREMIUM" + RESET + ")");
                    console.log(" Check If Token Is Mutable: " + RED + "OFF" + RESET + "(" + YELLOW + "PREMIUM" + RESET + ")");
                    console.log(" Check If Token Is Freezable: " + RED + "OFF" + RESET + "(" + YELLOW + "PREMIUM" + RESET + ")");
                    console.log(" Check If Token Has LP Burned: " + RED + "OFF" + RESET + "(" + YELLOW + "PREMIUM" + RESET + ")");
                    console.log(" Check If Token Is Renounced: " + RED + "OFF" + RESET + "(" + YELLOW + "PREMIUM" + RESET + ")");
                    console.log(" Check If Token Has LP Locked: " + RED + "OFF" + RESET + "(" + YELLOW + "PREMIUM" + RESET + ")");
                    console.log('');
                    if (!(!wsolBalance || wsolBalance == 0))
                        // await unwrapSol(quoteTokenAssociatedAddress)
                        // load tokens to snipe
                        loadSnipeList();
                    return [2 /*return*/];
            }
        });
    });
}
function saveTokenAccount(mint, accountData) {
    var ata = (0, spl_token_1.getAssociatedTokenAddressSync)(mint, wallet.publicKey);
    var tokenAccount = {
        address: ata,
        mint: mint,
        market: {
            bids: accountData.bids,
            asks: accountData.asks,
            eventQueue: accountData.eventQueue,
        },
    };
    existingTokenAccounts.set(mint.toString(), tokenAccount);
    return tokenAccount;
}
function processRaydiumPool(id, poolState) {
    return __awaiter(this, void 0, void 0, function () {
        var quoteBalance, poolSize, error_1, mintOption, isSocial, mutable, burned;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (idDealt == id.toString())
                        return [2 /*return*/];
                    idDealt = id.toBase58();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, solanaConnection.getBalance(poolState.quoteVault, "processed")];
                case 2:
                    quoteBalance = (_a.sent()) / Math.pow(10, 9);
                    if (!shouldBuy(poolState.baseMint.toString())) {
                        return [2 /*return*/];
                    }
                    console.log("Detected a new pool: https://dexscreener.com/solana/".concat(id.toString()));
                    if (!quoteMinPoolSizeAmount.isZero()) {
                        console.log("Processing pool: ".concat(id.toString(), " with ").concat(quoteBalance.toFixed(2), " ").concat(quoteToken.symbol, " in liquidity"));
                        // if (poolSize.lt(quoteMinPoolSizeAmount)) {
                        if (parseFloat(constants_1.MIN_POOL_SIZE) > quoteBalance) {
                            console.log("Skipping pool, smaller than ".concat(constants_1.MIN_POOL_SIZE, " ").concat(quoteToken.symbol));
                            console.log("-------------------------------------- \n");
                            return [2 /*return*/];
                        }
                    }
                    if (!quoteMaxPoolSizeAmount.isZero()) {
                        poolSize = new raydium_sdk_1.TokenAmount(quoteToken, poolState.swapQuoteInAmount, true);
                        // if (poolSize.gt(quoteMaxPoolSizeAmount)) {
                        if (parseFloat(constants_1.MAX_POOL_SIZE) < quoteBalance) {
                            console.log("Skipping pool, larger than ".concat(constants_1.MIN_POOL_SIZE, " ").concat(quoteToken.symbol));
                            console.log("Skipping pool, bigger than ".concat(quoteMaxPoolSizeAmount.toFixed(), " ").concat(quoteToken.symbol), "Swap quote in amount: ".concat(poolSize.toFixed()));
                            console.log("-------------------------------------- \n");
                            return [2 /*return*/];
                        }
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.log("Error in getting new pool balance, ".concat(error_1));
                    return [3 /*break*/, 4];
                case 4:
                    if (!constants_1.CHECK_IF_MINT_IS_RENOUNCED) return [3 /*break*/, 6];
                    return [4 /*yield*/, checkMintable(poolState.baseMint)];
                case 5:
                    mintOption = _a.sent();
                    if (mintOption !== true) {
                        console.log('Skipping, owner can mint tokens!', poolState.baseMint);
                        return [2 /*return*/];
                    }
                    _a.label = 6;
                case 6:
                    if (!constants_1.CHECK_SOCIAL) return [3 /*break*/, 8];
                    return [4 /*yield*/, (0, tokenFilter_1.checkSocial)(solanaConnection, poolState.baseMint, constants_1.COMMITMENT_LEVEL)];
                case 7:
                    isSocial = _a.sent();
                    if (isSocial !== true) {
                        console.log('Skipping, token does not have socials', poolState.baseMint);
                        return [2 /*return*/];
                    }
                    _a.label = 8;
                case 8:
                    if (!constants_1.CHECK_IF_MINT_IS_MUTABLE) return [3 /*break*/, 10];
                    return [4 /*yield*/, (0, tokenFilter_1.checkMutable)(solanaConnection, poolState.baseMint)];
                case 9:
                    mutable = _a.sent();
                    if (mutable == true) {
                        console.log('Skipping, token is mutable!', poolState.baseMint);
                        return [2 /*return*/];
                    }
                    _a.label = 10;
                case 10:
                    if (!constants_1.CHECK_IF_MINT_IS_BURNED) return [3 /*break*/, 12];
                    return [4 /*yield*/, (0, tokenFilter_1.checkBurn)(solanaConnection, poolState.lpMint, constants_1.COMMITMENT_LEVEL)];
                case 11:
                    burned = _a.sent();
                    if (burned !== true) {
                        console.log('Skipping, token is not burned!', poolState.baseMint);
                        return [2 /*return*/];
                    }
                    _a.label = 12;
                case 12:
                    processingToken = true;
                    return [4 /*yield*/, buy(id, poolState)];
                case 13:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.processRaydiumPool = processRaydiumPool;
function checkMintable(vault) {
    return __awaiter(this, void 0, void 0, function () {
        var data, deserialize, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, solanaConnection.getAccountInfo(vault)];
                case 1:
                    data = ((_a.sent()) || {}).data;
                    if (!data) {
                        return [2 /*return*/];
                    }
                    deserialize = types_1.MintLayout.decode(data);
                    return [2 /*return*/, deserialize.mintAuthorityOption === 0];
                case 2:
                    e_1 = _a.sent();
                    utils_1.logger.debug(e_1);
                    console.log("Failed to check if mint is renounced", vault);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.checkMintable = checkMintable;
function processOpenBookMarket(updatedAccountInfo) {
    return __awaiter(this, void 0, void 0, function () {
        var accountData;
        return __generator(this, function (_a) {
            try {
                accountData = raydium_sdk_1.MARKET_STATE_LAYOUT_V3.decode(updatedAccountInfo.accountInfo.data);
                // to be competitive, we collect market data before buying the token...
                if (existingTokenAccounts.has(accountData.baseMint.toString())) {
                    return [2 /*return*/];
                }
                saveTokenAccount(accountData.baseMint, accountData);
            }
            catch (e) {
                utils_1.logger.debug(e);
                console.log("Failed to process market, mint: ", accountData === null || accountData === void 0 ? void 0 : accountData.baseMint);
            }
            return [2 /*return*/];
        });
    });
}
exports.processOpenBookMarket = processOpenBookMarket;
function buy(accountId, accountData) {
    return __awaiter(this, void 0, void 0, function () {
        var tokenAccount, market, innerTransaction, latestBlockhash, instructions, messageV0, transaction, result, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("\u001B[32m%s\u001B[0m", "---------------------------------------------------------------");
                    console.log("All checks completed. Buying...");
                    console.log("\u001B[32m%s\u001B[0m", "---------------------------------------------------------------");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 13, , 14]);
                    tokenAccount = existingTokenAccounts.get(accountData.baseMint.toString());
                    tokenAccountInCommon = tokenAccount;
                    accountDataInCommon = accountData;
                    if (!!tokenAccount) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, market_1.getMinimalMarketV3)(solanaConnection, accountData.marketId, constants_1.COMMITMENT_LEVEL)];
                case 2:
                    market = _a.sent();
                    tokenAccount = saveTokenAccount(accountData.baseMint, market);
                    _a.label = 3;
                case 3:
                    tokenAccount.poolKeys = (0, liquidity_1.createPoolKeys)(accountId, accountData, tokenAccount.market);
                    innerTransaction = raydium_sdk_1.Liquidity.makeSwapFixedInInstruction({
                        poolKeys: tokenAccount.poolKeys,
                        userKeys: {
                            tokenAccountIn: quoteTokenAssociatedAddress,
                            tokenAccountOut: tokenAccount.address,
                            owner: wallet.publicKey,
                        },
                        amountIn: quoteAmount.raw,
                        minAmountOut: 0,
                    }, tokenAccount.poolKeys.version).innerTransaction;
                    return [4 /*yield*/, solanaConnection.getLatestBlockhash({
                            commitment: constants_1.COMMITMENT_LEVEL,
                        })];
                case 4:
                    latestBlockhash = _a.sent();
                    instructions = [];
                    return [4 /*yield*/, solanaConnection.getAccountInfo(quoteTokenAssociatedAddress)];
                case 5:
                    if (!(_a.sent()))
                        instructions.push((0, spl_token_1.createAssociatedTokenAccountInstruction)(wallet.publicKey, quoteTokenAssociatedAddress, wallet.publicKey, spl_token_1.NATIVE_MINT));
                    instructions.push.apply(instructions, __spreadArray([web3_js_1.SystemProgram.transfer({
                            fromPubkey: wallet.publicKey,
                            toPubkey: quoteTokenAssociatedAddress,
                            lamports: Math.ceil(parseFloat(constants_1.QUOTE_AMOUNT) * Math.pow(10, 9)),
                        }),
                        (0, spl_token_1.createSyncNativeInstruction)(quoteTokenAssociatedAddress, spl_token_1.TOKEN_PROGRAM_ID),
                        (0, spl_token_1.createAssociatedTokenAccountIdempotentInstruction)(wallet.publicKey, tokenAccount.address, wallet.publicKey, accountData.baseMint)], innerTransaction.instructions, false));
                    messageV0 = new web3_js_1.TransactionMessage({
                        payerKey: wallet.publicKey,
                        recentBlockhash: latestBlockhash.blockhash,
                        instructions: instructions,
                    }).compileToV0Message();
                    transaction = new web3_js_1.VersionedTransaction(messageV0);
                    transaction.sign(__spreadArray([wallet], innerTransaction.signers, true));
                    if (!constants_1.JITO_MODE) return [3 /*break*/, 10];
                    if (!constants_1.JITO_ALL) return [3 /*break*/, 7];
                    return [4 /*yield*/, (0, jitoWithAxios_1.jitoWithAxios)(transaction, wallet, latestBlockhash)];
                case 6:
                    _a.sent();
                    return [3 /*break*/, 9];
                case 7: return [4 /*yield*/, (0, jito_1.bundle)([transaction], wallet)];
                case 8:
                    result = _a.sent();
                    _a.label = 9;
                case 9: return [3 /*break*/, 12];
                case 10: return [4 /*yield*/, (0, legacy_1.execute)(transaction, latestBlockhash)];
                case 11:
                    _a.sent();
                    _a.label = 12;
                case 12: return [3 /*break*/, 14];
                case 13:
                    e_2 = _a.sent();
                    utils_1.logger.debug(e_2);
                    console.log("Failed to buy token, ".concat(accountData.baseMint));
                    return [3 /*break*/, 14];
                case 14: return [2 /*return*/];
            }
        });
    });
}
function sell(mint_1, amount_1) {
    return __awaiter(this, arguments, void 0, function (mint, amount, isTp1Sell) {
        var tokenAccount, innerTransaction, tx, _a, latestBlockhash, messageV0, transaction, e_3;
        var _b;
        if (isTp1Sell === void 0) { isTp1Sell = false; }
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 10, , 12]);
                    tokenAccount = existingTokenAccounts.get(mint.toString());
                    if (!tokenAccount) {
                        console.log("Sell token account not exist");
                        return [2 /*return*/];
                    }
                    if (!tokenAccount.poolKeys) {
                        console.log('No pool keys found: ', mint);
                        return [2 /*return*/];
                    }
                    if (amount == "0") {
                        console.log("Checking: Sold already", tokenAccount.mint);
                        return [2 /*return*/];
                    }
                    innerTransaction = raydium_sdk_1.Liquidity.makeSwapFixedInInstruction({
                        poolKeys: tokenAccount.poolKeys,
                        userKeys: {
                            tokenAccountOut: quoteTokenAssociatedAddress,
                            tokenAccountIn: tokenAccount.address,
                            owner: wallet.publicKey,
                        },
                        amountIn: amount,
                        minAmountOut: 0,
                    }, tokenAccount.poolKeys.version).innerTransaction;
                    tx = (_b = new web3_js_1.Transaction()).add.apply(_b, innerTransaction.instructions);
                    tx.feePayer = wallet.publicKey;
                    _a = tx;
                    return [4 /*yield*/, solanaConnection.getLatestBlockhash()];
                case 1:
                    _a.recentBlockhash = (_c.sent()).blockhash;
                    return [4 /*yield*/, solanaConnection.getLatestBlockhash({
                            commitment: constants_1.COMMITMENT_LEVEL,
                        })];
                case 2:
                    latestBlockhash = _c.sent();
                    messageV0 = new web3_js_1.TransactionMessage({
                        payerKey: wallet.publicKey,
                        recentBlockhash: latestBlockhash.blockhash,
                        instructions: __spreadArray(__spreadArray([], innerTransaction.instructions, true), [
                            (0, spl_token_1.createCloseAccountInstruction)(quoteTokenAssociatedAddress, wallet.publicKey, wallet.publicKey),
                        ], false),
                    }).compileToV0Message();
                    transaction = new web3_js_1.VersionedTransaction(messageV0);
                    transaction.sign(__spreadArray([wallet], innerTransaction.signers, true));
                    if (!constants_1.JITO_MODE) return [3 /*break*/, 7];
                    if (!constants_1.JITO_ALL) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, jitoWithAxios_1.jitoWithAxios)(transaction, wallet, latestBlockhash)];
                case 3:
                    _c.sent();
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, (0, jito_1.bundle)([transaction], wallet)];
                case 5:
                    _c.sent();
                    _c.label = 6;
                case 6: return [3 /*break*/, 9];
                case 7: return [4 /*yield*/, (0, legacy_1.execute)(transaction, latestBlockhash)];
                case 8:
                    _c.sent();
                    _c.label = 9;
                case 9: return [3 /*break*/, 12];
                case 10:
                    e_3 = _c.sent();
                    return [4 /*yield*/, sleep(1000)];
                case 11:
                    _c.sent();
                    utils_1.logger.debug(e_3);
                    return [3 /*break*/, 12];
                case 12:
                    setTimeout(function () {
                        processingToken = false;
                    }, 15000);
                    if (!!isTp1Sell) return [3 /*break*/, 14];
                    return [4 /*yield*/, sell(mint, amount, true)];
                case 13:
                    _c.sent();
                    _c.label = 14;
                case 14: return [2 /*return*/];
            }
        });
    });
}
exports.sell = sell;
function loadSnipeList() {
    if (!constants_1.USE_SNIPE_LIST) {
        return;
    }
    var count = snipeList.length;
    var data = fs.readFileSync(path.join(__dirname, 'snipe-list.txt'), 'utf-8');
    snipeList = data
        .split('\n')
        .map(function (a) { return a.trim(); })
        .filter(function (a) { return a; });
    if (snipeList.length != count) {
        console.log("Loaded snipe list: ".concat(snipeList.length));
    }
}
function shouldBuy(key) {
    return constants_1.USE_SNIPE_LIST ? snipeList.includes(key) : constants_1.ONE_TOKEN_AT_A_TIME ? !processingToken : true;
}
var runListener = function () { return __awaiter(void 0, void 0, void 0, function () {
    var runTimestamp, raydiumSubscriptionId, openBookSubscriptionId, walletSubscriptionId;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, init()];
            case 1:
                _a.sent();
                trackWallet(solanaConnection);
                runTimestamp = Math.floor(new Date().getTime() / 1000);
                raydiumSubscriptionId = solanaConnection.onProgramAccountChange(liquidity_1.RAYDIUM_LIQUIDITY_PROGRAM_ID_V4, function (updatedAccountInfo) { return __awaiter(void 0, void 0, void 0, function () {
                    var key, poolState, poolOpenTime, existing, _;
                    return __generator(this, function (_a) {
                        key = updatedAccountInfo.accountId.toString();
                        poolState = raydium_sdk_1.LIQUIDITY_STATE_LAYOUT_V4.decode(updatedAccountInfo.accountInfo.data);
                        poolOpenTime = parseInt(poolState.poolOpenTime.toString());
                        existing = existingLiquidityPools.has(key);
                        if (poolOpenTime > runTimestamp && !existing) {
                            existingLiquidityPools.add(key);
                            _ = processRaydiumPool(updatedAccountInfo.accountId, poolState);
                            poolId = updatedAccountInfo.accountId;
                        }
                        return [2 /*return*/];
                    });
                }); }, constants_1.COMMITMENT_LEVEL, [
                    { dataSize: raydium_sdk_1.LIQUIDITY_STATE_LAYOUT_V4.span },
                    {
                        memcmp: {
                            offset: raydium_sdk_1.LIQUIDITY_STATE_LAYOUT_V4.offsetOf('quoteMint'),
                            bytes: quoteToken.mint.toBase58(),
                        },
                    },
                    {
                        memcmp: {
                            offset: raydium_sdk_1.LIQUIDITY_STATE_LAYOUT_V4.offsetOf('marketProgramId'),
                            bytes: liquidity_1.OPENBOOK_PROGRAM_ID.toBase58(),
                        },
                    },
                    {
                        memcmp: {
                            offset: raydium_sdk_1.LIQUIDITY_STATE_LAYOUT_V4.offsetOf('status'),
                            bytes: bs58_1.default.encode([6, 0, 0, 0, 0, 0, 0, 0]),
                        },
                    },
                ]);
                openBookSubscriptionId = solanaConnection.onProgramAccountChange(liquidity_1.OPENBOOK_PROGRAM_ID, function (updatedAccountInfo) { return __awaiter(void 0, void 0, void 0, function () {
                    var key, existing, _;
                    return __generator(this, function (_a) {
                        key = updatedAccountInfo.accountId.toString();
                        existing = existingOpenBookMarkets.has(key);
                        if (!existing) {
                            existingOpenBookMarkets.add(key);
                            _ = processOpenBookMarket(updatedAccountInfo);
                        }
                        return [2 /*return*/];
                    });
                }); }, constants_1.COMMITMENT_LEVEL, [
                    { dataSize: raydium_sdk_1.MARKET_STATE_LAYOUT_V3.span },
                    {
                        memcmp: {
                            offset: raydium_sdk_1.MARKET_STATE_LAYOUT_V3.offsetOf('quoteMint'),
                            bytes: quoteToken.mint.toBase58(),
                        },
                    },
                ]);
                walletSubscriptionId = solanaConnection.onProgramAccountChange(spl_token_1.TOKEN_PROGRAM_ID, function (updatedAccountInfo) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, walletChange(updatedAccountInfo)];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); }, constants_1.COMMITMENT_LEVEL, [
                    {
                        dataSize: 165,
                    },
                    {
                        memcmp: {
                            offset: 32,
                            bytes: wallet.publicKey.toBase58(),
                        },
                    },
                ]);
                console.log("\u001B[32m%s\u001B[0m", '-------------------------------------------');
                console.log("\u001B[32m%s\u001B[0m", ' Bot is running! Press CTRL + C to stop it.');
                console.log("\u001B[32m%s\u001B[0m", '-------------------------------------------');
                if (constants_1.USE_SNIPE_LIST) {
                    setInterval(loadSnipeList, constants_1.SNIPE_LIST_REFRESH_INTERVAL);
                }
                return [2 /*return*/];
        }
    });
}); };
var unwrapSol = function (wSolAccount) { return __awaiter(void 0, void 0, void 0, function () {
    var wsolAccountInfo, wsolBalanace, instructions, latestBlockhash, messageV0, transaction, result, result, wBal, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 14, , 15]);
                return [4 /*yield*/, solanaConnection.getAccountInfo(wSolAccount)];
            case 1:
                wsolAccountInfo = _a.sent();
                if (!wsolAccountInfo) return [3 /*break*/, 13];
                return [4 /*yield*/, solanaConnection.getBalance(wSolAccount)];
            case 2:
                wsolBalanace = _a.sent();
                console.log("Trying to unwrap ".concat(wsolBalanace / Math.pow(10, 9), "wsol to sol"));
                instructions = [];
                instructions.push((0, spl_token_1.createCloseAccountInstruction)(wSolAccount, wallet.publicKey, wallet.publicKey));
                return [4 /*yield*/, solanaConnection.getLatestBlockhash({
                        commitment: constants_1.COMMITMENT_LEVEL,
                    })];
            case 3:
                latestBlockhash = _a.sent();
                messageV0 = new web3_js_1.TransactionMessage({
                    payerKey: wallet.publicKey,
                    recentBlockhash: latestBlockhash.blockhash,
                    instructions: __spreadArray([], instructions, true),
                }).compileToV0Message();
                transaction = new web3_js_1.VersionedTransaction(messageV0);
                transaction.sign([wallet]);
                if (!constants_1.JITO_MODE) return [3 /*break*/, 8];
                if (!constants_1.JITO_ALL) return [3 /*break*/, 5];
                return [4 /*yield*/, (0, jitoWithAxios_1.jitoWithAxios)(transaction, wallet, latestBlockhash)];
            case 4:
                result = _a.sent();
                return [3 /*break*/, 7];
            case 5: return [4 /*yield*/, (0, jito_1.bundle)([transaction], wallet)];
            case 6:
                result = _a.sent();
                _a.label = 7;
            case 7: return [3 /*break*/, 10];
            case 8: return [4 /*yield*/, (0, legacy_1.execute)(transaction, latestBlockhash)];
            case 9:
                _a.sent();
                _a.label = 10;
            case 10: return [4 /*yield*/, sleep(5000)];
            case 11:
                _a.sent();
                return [4 /*yield*/, solanaConnection.getBalance(wSolAccount)];
            case 12:
                wBal = _a.sent();
                if (wBal > 0) {
                    console.log("Unwrapping WSOL failed");
                }
                else {
                    console.log("Successfully unwrapped WSOL to SOL");
                }
                _a.label = 13;
            case 13: return [3 /*break*/, 15];
            case 14:
                error_2 = _a.sent();
                console.log("Error unwrapping WSOL");
                return [3 /*break*/, 15];
            case 15: return [2 /*return*/];
        }
    });
}); };
var inputAction = function (accountId, mint, amount) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        console.log("\n\n\n==========================================================\n\n\n");
        rl.question('If you want to sell, input "sell" and press enter: \n\n', function (data) { return __awaiter(void 0, void 0, void 0, function () {
            var input;
            return __generator(this, function (_a) {
                input = data.toString().trim();
                if (input === 'sell') {
                    timesChecked = 1000000;
                }
                else {
                    console.log('Received input invalid :\t', input);
                    inputAction(accountId, mint, amount);
                }
                return [2 /*return*/];
            });
        }); });
        return [2 /*return*/];
    });
}); };
var priceMatch = function (amountIn, poolKeys) { return __awaiter(void 0, void 0, void 0, function () {
    var priceMatchAtOne, timesToCheck, temp, tokenAmount, sellAt1, slippage, tp1, tp2, sl, poolInfo, amountOut, pnl, amountOutNum, e_4, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 9, , 10]);
                if (constants_1.PRICE_CHECK_DURATION === 0 || constants_1.PRICE_CHECK_INTERVAL === 0) {
                    return [2 /*return*/];
                }
                priceMatchAtOne = false;
                timesToCheck = constants_1.PRICE_CHECK_DURATION / constants_1.PRICE_CHECK_INTERVAL;
                temp = amountIn.raw.toString();
                tokenAmount = new bn_js_1.BN(temp.substring(0, temp.length - 2));
                sellAt1 = tokenAmount.mul(new bn_js_1.BN(constants_1.SELL_AT_TP1)).toString();
                slippage = new raydium_sdk_1.Percent(constants_1.SELL_SLIPPAGE, 100);
                tp1 = Number((Number(constants_1.QUOTE_AMOUNT) * (100 + constants_1.TAKE_PROFIT1) / 100).toFixed(4));
                tp2 = Number((Number(constants_1.QUOTE_AMOUNT) * (100 + constants_1.TAKE_PROFIT2) / 100).toFixed(4));
                sl = Number((Number(constants_1.QUOTE_AMOUNT) * (100 - constants_1.STOP_LOSS) / 100).toFixed(4));
                timesChecked = 0;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, 4, 5]);
                return [4 /*yield*/, raydium_sdk_1.Liquidity.fetchInfo({
                        connection: solanaConnection,
                        poolKeys: poolKeys,
                    })];
            case 2:
                poolInfo = _a.sent();
                amountOut = raydium_sdk_1.Liquidity.computeAmountOut({
                    poolKeys: poolKeys,
                    poolInfo: poolInfo,
                    amountIn: amountIn,
                    currencyOut: quoteToken,
                    slippage: slippage,
                }).amountOut;
                pnl = (Number(amountOut.toFixed(6)) - Number(constants_1.QUOTE_AMOUNT)) / Number(constants_1.QUOTE_AMOUNT) * 100;
                if (timesChecked > 0) {
                    (0, utils_1.deleteConsoleLines)(1);
                }
                console.log("Profit on TP Level 1: ".concat(tp1, " SOL | Profit on TP Level 1: ").concat(tp2, " SOL  | Profit on Stop Loss: ").concat(sl, " SOL | Bought with: ").concat(constants_1.QUOTE_AMOUNT, " SOL | Current value: ").concat(amountOut.toFixed(4), " SOL | PNL: ").concat(pnl.toFixed(3), "%"));
                amountOutNum = Number(amountOut.toFixed(7));
                if (amountOutNum < sl) {
                    console.log("Token is on stop loss point, will sell with loss");
                    return [3 /*break*/, 8];
                }
                // if (amountOutNum > tp1) {
                if (pnl > constants_1.TAKE_PROFIT1) {
                    if (!priceMatchAtOne) {
                        console.log("\u001B[32m%s\u001B[0m", "---------------------------------------------------------------");
                        console.log("Token is on first take profit level, will sell some and be waiting for second take profit level");
                        console.log("\u001B[32m%s\u001B[0m", "---------------------------------------------------------------");
                        priceMatchAtOne = true;
                        soldSome = true;
                        sell(poolKeys.baseMint, sellAt1, true);
                        // break
                    }
                }
                // if (amountOutNum < tp1 && priceMatchAtOne) {
                if (pnl < constants_1.TAKE_PROFIT1 && priceMatchAtOne) {
                    console.log("\u001B[32m%s\u001B[0m", "---------------------------------------------------------------");
                    console.log("Token is on first take profit level again, will sell with first take profit level");
                    console.log("\u001B[32m%s\u001B[0m", "---------------------------------------------------------------");
                    return [3 /*break*/, 8];
                }
                // if (amountOutNum > tp2) {
                if (pnl > constants_1.TAKE_PROFIT2) {
                    console.log("\u001B[32m%s\u001B[0m", "---------------------------------------------------------------");
                    console.log("Token is on second take profit level, will sell with second take profit level");
                    console.log("\u001B[32m%s\u001B[0m", "---------------------------------------------------------------");
                    return [3 /*break*/, 8];
                }
                return [3 /*break*/, 5];
            case 3:
                e_4 = _a.sent();
                return [3 /*break*/, 5];
            case 4:
                timesChecked++;
                return [7 /*endfinally*/];
            case 5: return [4 /*yield*/, sleep(constants_1.PRICE_CHECK_INTERVAL)];
            case 6:
                _a.sent();
                _a.label = 7;
            case 7:
                if (timesChecked < timesToCheck) return [3 /*break*/, 1];
                _a.label = 8;
            case 8: return [3 /*break*/, 10];
            case 9:
                error_3 = _a.sent();
                console.log("Error when setting profit amounts", error_3);
                return [3 /*break*/, 10];
            case 10: return [2 /*return*/];
        }
    });
}); };
var sleep = function (ms) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, ms); })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var bought = spl_token_1.NATIVE_MINT.toBase58();
var walletChange = function (updatedAccountInfo) { return __awaiter(void 0, void 0, void 0, function () {
    var accountData, tokenAccount, tokenBalance, tokenIn, tokenAmountIn, tokenBalanceAfterCheck, _, _;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                accountData = spl_token_1.AccountLayout.decode(updatedAccountInfo.accountInfo.data);
                if (updatedAccountInfo.accountId.equals(quoteTokenAssociatedAddress)) {
                    return [2 /*return*/];
                }
                if (!(tokenAccountInCommon && accountDataInCommon)) return [3 /*break*/, 8];
                if (!(bought != accountDataInCommon.baseMint.toBase58())) return [3 /*break*/, 8];
                console.log("\u001B[32m%s\u001B[0m", "------------- Token Buy Transaction Successfull ---------------");
                console.log("https://dexscreener.com/solana/".concat(accountDataInCommon.baseMint.toBase58()));
                console.log("PHOTON: https://photon-sol.tinyastro.io/en/lp/".concat(tokenAccountInCommon.poolKeys.id.toString()));
                console.log("DEXSCREENER: https://dexscreener.com/solana/".concat(tokenAccountInCommon.poolKeys.id.toString()));
                console.log("JUPITER: https://jup.ag/swap/".concat(accountDataInCommon.baseMint.toBase58(), "-SOL"));
                console.log("BIRDEYE: https://birdeye.so/token/".concat(accountDataInCommon.baseMint.toBase58(), "?chain=solana\n\n"));
                bought = accountDataInCommon.baseMint.toBase58();
                return [4 /*yield*/, (0, spl_token_1.getAssociatedTokenAddress)(accountData.mint, wallet.publicKey)];
            case 1:
                tokenAccount = _a.sent();
                return [4 /*yield*/, getTokenBalance(tokenAccount)];
            case 2:
                tokenBalance = _a.sent();
                if (tokenBalance == "0") {
                    console.log("Detected a new pool, but didn't confirm buy action");
                    return [2 /*return*/];
                }
                tokenIn = new raydium_sdk_1.Token(spl_token_1.TOKEN_PROGRAM_ID, tokenAccountInCommon.poolKeys.baseMint, tokenAccountInCommon.poolKeys.baseDecimals);
                tokenAmountIn = new raydium_sdk_1.TokenAmount(tokenIn, tokenBalance, true);
                inputAction(updatedAccountInfo.accountId, accountData.mint, tokenBalance);
                return [4 /*yield*/, priceMatch(tokenAmountIn, tokenAccountInCommon.poolKeys)];
            case 3:
                _a.sent();
                return [4 /*yield*/, getTokenBalance(tokenAccount)];
            case 4:
                tokenBalanceAfterCheck = _a.sent();
                if (tokenBalanceAfterCheck == "0") {
                    return [2 /*return*/];
                }
                if (!soldSome) return [3 /*break*/, 6];
                soldSome = false;
                return [4 /*yield*/, sell(tokenAccountInCommon.poolKeys.baseMint, tokenBalanceAfterCheck)];
            case 5:
                _ = _a.sent();
                return [3 /*break*/, 8];
            case 6: return [4 /*yield*/, sell(tokenAccountInCommon.poolKeys.baseMint, accountData.amount)];
            case 7:
                _ = _a.sent();
                _a.label = 8;
            case 8: return [2 /*return*/];
        }
    });
}); };
var getTokenBalance = function (tokenAccount) { return __awaiter(void 0, void 0, void 0, function () {
    var tokenBalance, index, tokenBal, uiAmount, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                tokenBalance = "0";
                index = 0;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 6]);
                return [4 /*yield*/, solanaConnection.getTokenAccountBalance(tokenAccount, 'processed')];
            case 2:
                tokenBal = (_a.sent()).value;
                uiAmount = tokenBal.uiAmount;
                if (index > 10) {
                    return [3 /*break*/, 7];
                }
                if (uiAmount && uiAmount > 0) {
                    tokenBalance = tokenBal.amount;
                    console.log("Current Token Balance is: ".concat(uiAmount));
                    return [3 /*break*/, 7];
                }
                return [4 /*yield*/, sleep(1000)];
            case 3:
                _a.sent();
                index++;
                return [3 /*break*/, 6];
            case 4:
                error_4 = _a.sent();
                return [4 /*yield*/, sleep(500)];
            case 5:
                _a.sent();
                return [3 /*break*/, 6];
            case 6:
                if (true) return [3 /*break*/, 1];
                _a.label = 7;
            case 7: return [2 /*return*/, tokenBalance];
        }
    });
}); };
function trackWallet(connection) {
    return __awaiter(this, void 0, void 0, function () {
        var wsolAta, error_5;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, spl_token_1.getAssociatedTokenAddress)(spl_token_1.NATIVE_MINT, wallet.publicKey)];
                case 1:
                    wsolAta = _a.sent();
                    connection.onLogs(wsolAta, function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
                        var logs = _b.logs, err = _b.err, signature = _b.signature;
                        return __generator(this, function (_c) {
                            if (err)
                                console.log("Transaction failed");
                            else {
                                console.log("\u001B[32m%s\u001B[0m", "---------------------------------------------------------------");
                                console.log("\nTransaction successful: https://solscan.io/tx/".concat(signature, "\n"));
                                console.log("\u001B[32m%s\u001B[0m", "---------------------------------------------------------------");
                            }
                            return [2 /*return*/];
                        });
                    }); }, "confirmed");
                    return [3 /*break*/, 3];
                case 2:
                    error_5 = _a.sent();
                    console.log("Transaction error : ", error_5);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
runListener();
