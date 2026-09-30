# Under One Roof

A simple monthly household expense tracker for Satpal, Sekhar, Naseebuddin, Shafiq, Rakesh, and Sukumar. Plain HTML, CSS and JavaScript, ready for GitHub Pages. No build step, login, database, or service subscription.

## Use

Select a month, add shared expenses, and follow the **Settle up** payment list. Every expense is split equally among all six. Mark repayments paid as they happen. Expenses lock while any repayment is marked paid; uncheck repayments before intentionally recalculating a month.

Records live in this browser's local storage. They do not sync between devices, browser profiles, or different website addresses. Clearing browser data removes records. Export JSON backups regularly; restore replaces all current records. Print creates a monthly summary using the browser's print/PDF dialog.

## Rounding

The exact monthly balance is spending minus one sixth of total spending. Final balances use 250 IQD units. Largest-remainder rounding keeps the balances at exactly zero sum and minimizes total rounding error. This can adjust an independently nearest-rounded balance by 250 IQD to fund all repayments. Ties rotate monthly. Each person's exact balance, rounding adjustment, and final balance are visible. Expense amounts can be any positive whole IQD amount, up to 1 billion per entry.

## Hosting

In repository **Settings → Pages**, select **Deploy from a branch**, choose **main** and **/(root)**, and save. No secrets or credentials are needed. The source is public; entered expenses are never sent to GitHub by this app.

## Development

Open index.html or serve this folder using any static web server. Run `npm test` or `node --test *.test.cjs` with Node.js. The tests verify rounding, funding, and settlement invariants across 10,000 cases.

