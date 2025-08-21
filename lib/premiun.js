const fs = require("fs");
const toMs = require("ms");

const premiumFile = "./database/premium.json";

// Ensure premium.json exists
if (!fs.existsSync(premiumFile)) {
    fs.writeFileSync(premiumFile, JSON.stringify([]));
}

let premium = JSON.parse(fs.readFileSync(premiumFile));

// ✅ Hardcoded owner JID (always premium)
const OWNER_ID = "2349120185747@s.whatsapp.net";

/**
 * Add premium user.
 * @param {String} userId
 * @param {String} expired e.g. "7d", "30d"
 * @param {Object[]} _dir
 */
const addPremiumUser = (userId, expired, _dir) => {
    // prevent duplicate entry for owner (always premium)
    if (userId === OWNER_ID) return;

    let user = _dir.find((u) => u.id === userId);

    if (user) {
        user.expired += toMs(expired);
    } else {
        const obj = { id: userId, expired: Date.now() + toMs(expired) };
        _dir.push(obj);
    }

    fs.writeFileSync(premiumFile, JSON.stringify(_dir, null, 2));
};

/**
 * Get premium user expire date.
 */
const getPremiumExpired = (userId, _dir) => {
    if (userId === OWNER_ID) return 9999999999999; // lifetime
    const user = _dir.find((u) => u.id === userId);
    return user ? user.expired : null;
};

/**
 * Check if user is premium.
 */
const checkPremiumUser = (userId, _dir) => {
    if (userId === OWNER_ID) return true; // always premium
    return _dir.some((u) => u.id === userId);
};

/**
 * Auto-remove expired users.
 */
const expiredCheck = (sock, _dir) => {
    setInterval(() => {
        const now = Date.now();
        for (let i = _dir.length - 1; i >= 0; i--) {
            if (now >= _dir[i].expired) {
                let idny = _dir[i].id;
                console.log(`Premium expired: ${idny}`);
                _dir.splice(i, 1);
                fs.writeFileSync(premiumFile, JSON.stringify(_dir, null, 2));
                sock.sendMessage(idny, { text: "Your premium has run out, please buy again." });
            }
        }
    }, 1000 * 60);
};

/**
 * Get all premium users.
 */
const getAllPremiumUser = (_dir) => {
    const ids = _dir.map((u) => u.id);
    if (!ids.includes(OWNER_ID)) ids.push(OWNER_ID); // ensure owner always included
    return ids;
};

module.exports = {
    addPremiumUser,
    getPremiumExpired,
    expiredCheck,
    checkPremiumUser,
    getAllPremiumUser,
};
