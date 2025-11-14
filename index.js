const express = require('express');
const fs = require('fs');
const { Client, LocalAuth } = require('whatsapp-web.js');
const QRCode = require('qrcode');
const qrcodeTerminal = require('qrcode-terminal');

const app = express(); // Express app
const PORT = process.env.PORT || 3000;

// Track conversation state per user
const userStates = {};

// Create WhatsApp client with session persistence
const client = new Client({
    authStrategy: new LocalAuth()
});

// Handle QR
client.on('qr', async (qr) => {
    try {
        // Delete previous QR if exists
        if (fs.existsSync('whatsapp-qr.png')) {
            fs.unlinkSync('whatsapp-qr.png');
        }
        await QRCode.toFile('whatsapp-qr.png', qr, { color: { dark: '#000', light: '#FFF' } });
        console.log('✅ QR code saved as whatsapp-qr.png! Scan it via /qr route.');
        qrcodeTerminal.generate(qr, { small: true });
    } catch (err) {
        console.error('❌ Error generating QR PNG:', err);
    }
});

// Serve QR PNG
app.get('/qr', (req, res) => {
    const filePath = './whatsapp-qr.png';
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath, { root: __dirname });
    } else {
        res.send('QR code not generated yet. Please wait a few seconds.');
    }
});

// Bot ready
client.on('ready', () => {
    console.log('✅ WhatsApp Bot is ready!');
});

// Keywords and responses
const keywords = {
    english: {
        greetings: ['hi', 'hello', 'sup', 'good morning', 'good evening'],
        howAreYou: ['how are you', 'how r u', 'how’s it going'],
        goodResponse: ['i’m good', 'i am good', 'im good', 'fine'],
        price: ['price', 'package', 'web design price', 'website cost'],
        services: ['services', 'what do you offer', 'services list'],
        website: ['website', 'web', 'web development', 'web dev'],
        identity: ['who are you', 'who is this', 'what is your name', 'who am i talking to'],
        contact: ['contact', 'phone', 'call', 'mobile', 'whatsapp'],
    },
    sinhala: {
        greetings: ['හෙලෝ', 'ආයුබෝවන්', 'සුබ උදෑසනක්', 'සුබ සන්ධ්‍යාවක්'],
        howAreYou: ['ඔබට කොහොමද', 'ඔබට කෙසේද'],
        goodResponse: ['හොඳින්', 'මම හොඳින් සිටිනවා'],
        price: ['මිල', 'පැකේජ්', 'වෙබ් ඩිසායින් මිල', 'website cost'],
        services: ['සේවාවන්', 'ඔබ ලබාදෙන සේවාවන්', 'සේවා ලැයිස්තුව'],
        website: ['වෙබ්සයිට්', 'වෙබ්අඩවිය', 'වෙබ් ඩිසායින්', 'වෙබ් dev'],
        identity: ['ඔයා කවුද', 'මෙය කවුද', 'ඔබ කවුද', 'ඔයාගේ නම මොකක්ද'],
        contact: ['සම්බන්ධ වීම', 'දුරකථන', 'දුරකථනය', 'මොබයිල්', 'whatsapp']
    }
};

// Predefined replies
const sinhalaGreetings = [
    'ආයුබෝවන්! VENASIC වෙත සාදරයෙන් පිලිගනිමු. ඔබට අපේ වෙබ්සයිට් ව්‍යාපෘති පිලිබද තොරතුරු ලබාදෙන්නද? 😊',
    'හෙලෝ 👋 VENASIC වෙතින් ඔබව පිලිගනිමු! ඔබට අපේ වෙබ්සයිට් සේවාවන් ගැන දැනගන්න අවශ්‍යද?',
    'සුභ දවසක්! VENASIC වෙත සාදරයෙන් පිලිගනිමු 💫 වෙබ්සයිට් ව්‍යාපෘති ගැන කතාකරමුද?'
];
const englishGreetings = [
    'Hello! Welcome to VENASIC. Would you like to know about our website projects? 😊',
    'Hey there 👋 Welcome to VENASIC! Want to hear about our 3D website designs?',
    'Howdy!🤠 VENASIC here 🌐 Would you like details about our web projects?'
];
const sinhalaIdentityReplies = [
    'මම Elina 💁‍♀️, VENASIC විසින් නිර්මාණය කර හා විශේෂ ලෙස නිමවා ඇති ව්‍යවසායක AI චැට්බොට් එකක්.',
    'මම Elina 💁‍♀️ — VENASIC විසින් නිර්මාණය කරපු virtual AI bot කෙනෙක්. ඔබට උදව් කරන්න මම ඉන්නෙයි!',
    'මම VENASIC Elina 💁‍♀️. මගේ අරමුණ ඔයාට වෙබ් ව්‍යාපෘති ගැන අවශ්‍ය සියලුම තොරතුරු ලබා දීමයි.'
];
const englishIdentityReplies = [
    'I’m Elina 💁‍♀️, a virtual AI assistant designed and handcrafted by VENASIC.',
    'My name’s Elina 💁‍♀️ — a digital AI bot created by VENASIC to assist you with website projects.',
    'Hi, I’m Elina 💁‍♀️. I’m an AI chatbot built by VENASIC to help you with your 3D web development needs.'
];
const sinhalaPrices = [
    'අපේ 3D Animated Website පැකේජයන් රු. 40,000 සිට ආරම්භ වේ 💻 ඔබට අවශ්‍ය විදිහට පැකේජය සකසා ගැනීමට අප අමතන්න!',
    'ඔබේ ව්‍යාපාරයට 3D වෙබ්සයිට් එකක් රු. 40,000 සිට! වැඩි විස්තර සඳහා අප හා සම්බන්ධ වන්න 🌐',
    'VENASIC වෙතින් 3D Animated වෙබ්සයිට් පැකේජයන් රු. 40,000 සිට ලැබෙනවා 🚀 ඔබට පහසු විදිහට එකක් සකසා ගන්න.'
];
const englishPrices = [
    'Our 3D Animated Website packages start from Rs. 40,000 💻 Contact us to customize your package!',
    'Get your 3D business website starting from Rs. 40,000 🌐 Let’s discuss the best plan for you.',
    '3D Animated Websites by VENASIC start at Rs. 40,000 🚀 Reach out to tailor one for your business.'
];
const sinhalaFallbacks = [
    'VENASIC වෙත පණිවිඩය එවීම සඳහා ස්තූතියි! ඔබේ 3D web development ව්‍යාපෘතිය සදහා අපගේ නියෝජිතයෙක් ඉක්මනින් ඔබව සම්බන්ධ කරගනී.',
    'ඔබේ පණිවිඩය අපට ලැබුණා 🙏 VENASIC කණ්ඩායම ඔබගේ 3D වෙබ්සයිට් අවශ්‍යතා පිළිබඳව ඉක්මනින් සම්බන්ධ වනු ඇත.',
    'ස්තූතියි! VENASIC වෙතින් නියෝජිතයෙක් ඔබගේ web project එක ගැන කතා කිරීමට ඉක්මනින්ම ඔබව අමතනු ඇත 🚀'
];
const englishFallbacks = [
    'Thanks for messaging VENASIC! Our team will contact you shortly about your 3D web development project.',
    'We’ve received your message 🙏 A VENASIC representative will reach out soon regarding your website project.',
    'Thank you! One of our web specialists will connect with you shortly to discuss your 3D website ideas 🚀'
];

// Handle incoming messages
client.on('message', msg => {
    const text = msg.body.toLowerCase();
    const chatId = msg.from;

    if (!userStates[chatId]) userStates[chatId] = {};
    const state = userStates[chatId];

    const isSinhala = /[\u0D80-\u0DFF]/.test(text);
    const lang = isSinhala ? 'sinhala' : 'english';
    const kw = keywords[lang];

    // Greeting
    if (kw.greetings.some(word => text.includes(word))) {
        const reply = isSinhala
            ? sinhalaGreetings[Math.floor(Math.random() * sinhalaGreetings.length)]
            : englishGreetings[Math.floor(Math.random() * englishGreetings.length)];
        msg.reply(reply);
        return;
    }

    // Identity
    if (kw.identity.some(word => text.includes(word))) {
        const reply = isSinhala
            ? sinhalaIdentityReplies[Math.floor(Math.random() * sinhalaIdentityReplies.length)]
            : englishIdentityReplies[Math.floor(Math.random() * englishIdentityReplies.length)];
        msg.reply(reply);
        return;
    }

    // How are you
    if (kw.howAreYou.some(word => text.includes(word))) {
        state.lastQuestion = 'howAreYou';
        msg.reply(isSinhala ? 'මම හොඳින් සිටිනවා. ඔබට කොහොමද?' : 'I’m fine. How about you?');
        return;
    }

    if (state.lastQuestion === 'howAreYou' && kw.goodResponse.some(word => text.includes(word))) {
        state.lastQuestion = 'askServices';
        msg.reply(isSinhala ? 'ඔබ හොඳින් සිටින බව ඇසීමට සතුටුයි! ඔබට අපේ 3D web development services ගැන දැනගන්න ඕනේද?' : "I'm glad to hear it! Would you like to know about our 3D web development services?");
        return;
    }

    if (state.lastQuestion === 'askServices' && text.includes(isSinhala ? 'ඔව්' : 'yes')) {
        msg.reply(isSinhala ?
`පරණ තාලේ 2D වෙබ්සයිට් එකක් වෙනුවට 3D Animated වෙබ්සයිට් එකක් ඔයාගේ බිස්නස් එකට? ඔව්, මේ ජාත්යන්තර මට්ටමේ Website එක Rs. 40,000 සිට හදාගන්න දැන් ඔයාටත් අවස්ථාව තියෙනවා.

අපෙන් ලැබෙන විශේෂාංග:

1. Domain එක පලමු වසර නොමිලේ
2. Custom animations ඔබට තෝරාගන්න පුළුවන්
3. Website එකට lifetime free hosting
4. නොමිලේ වෙලද දැන්වීම් 12ක් (10 adverts and 2 videos)
5. Website security lifetime free
6. Free AI chatbot (පාරිභෝගිකයන් සමග එකවර කතා කළ හැක)

ඔබට අවශ්‍යම වන්නේ පහත ක්‍රම තුනෙන් එකක්:

1. Static Websites (ตัวอย่าง: rc7salon.com)
2. JavaScript Frameworks (ตัวอย่าง: ucolcampus.com)
3. Full-Stack Frameworks

අදම WhatsApp කරන්න: https://wa.me/94765329117`
        :
`Instead of an old 2D website, get a 3D Animated Website for your business! Yes, you can get an international-level website starting from Rs. 40,000.

Features you get from Venas International:

1. Free domain for the first year
2. Choose your custom animations
3. Lifetime free hosting
4. 12 free adverts (10 images + 2 videos)
5. Lifetime free website security
6. Free AI chatbot (can chat with many customers at once)

You can create your website using one of these three options:

1. Static Websites (e.g., rc7salon.com)
2. JavaScript Frameworks (e.g., ucolcampus.com)
3. Full-Stack Frameworks

Contact us today on WhatsApp: https://wa.me/94765329117`);
        state.lastQuestion = null;
        return;
    }

    // Price
    if (kw.price.some(word => text.includes(word))) {
        const reply = isSinhala
            ? sinhalaPrices[Math.floor(Math.random() * sinhalaPrices.length)]
            : englishPrices[Math.floor(Math.random() * englishPrices.length)];
        msg.reply(reply);
        return;
    }

    // Fallback
    const reply = isSinhala
        ? sinhalaFallbacks[Math.floor(Math.random() * sinhalaFallbacks.length)]
        : englishFallbacks[Math.floor(Math.random() * englishFallbacks.length)];
    msg.reply(reply);
});

// Start server & WhatsApp client
app.listen(PORT, () => {
    console.log(`HTTP server running on port ${PORT}`);
    client.initialize();
});
