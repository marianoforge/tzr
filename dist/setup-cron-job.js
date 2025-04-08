"use strict";
/**
 * This script helps set up a cron job for recurring expenses.
 * You can run it on your server or use a cloud service like AWS Lambda, Google Cloud Functions, or Vercel Cron Jobs.
 *
 * For Vercel Cron Jobs, add this to your vercel.json:
 *
 * {
 *   "crons": [
 *     {
 *       "path": "/api/cron/process-recurring-expenses",
 *       "schedule": "0 0 1 * *"  // Run at midnight on the 1st of every month
 *     }
 *   ]
 * }
 *
 * For a traditional server, you can set up a cron job with:
 * 0 0 1 * * curl -X POST -H "X-API-Key: YOUR_API_KEY" https://your-domain.com/api/cron/process-recurring-expenses
 *
 * Make sure to set CRON_API_KEY in your environment variables.
 */
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Main script for testing the recurring expenses endpoint
// Run with: npx ts-node scripts/setup-cron-job.ts
var path = __importStar(require("path"));
var dotenv = __importStar(require("dotenv"));
var node_fetch_1 = __importDefault(require("node-fetch"));
// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var BASE_URL, API_URL, API_KEY, response, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
                    API_URL = "".concat(BASE_URL, "/api/cron/process-recurring-expenses");
                    API_KEY = process.env.CRON_API_KEY;
                    if (!API_KEY) {
                        console.error('❌ Error: CRON_API_KEY environment variable is not set!');
                        process.exit(1);
                    }
                    console.log("\uD83D\uDD39 Testing recurring expenses processing at ".concat(API_URL, "..."));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, (0, node_fetch_1.default)(API_URL, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-API-Key': API_KEY,
                            },
                        })];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    if (response.ok) {
                        console.log('✅ Test successful! Response:', data);
                    }
                    else {
                        console.error('❌ Test failed! Response:', data);
                    }
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.error('❌ Error testing recurring expenses:', error_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// Execute the main function
main().catch(console.error);
