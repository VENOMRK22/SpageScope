
const API_KEY = 'R2cIRYVyBMgBGQJAqVLPX4F5EjsbANcctPdUmpta';

async function testAPOD() {
    console.log("Testing APOD API...");
    try {
        const res = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&count=1`);
        if (res.ok) {
            console.log("APOD Success:", res.status);
            const data = await res.json();
            console.log("Sample Data:", data[0]?.title);
        } else {
            console.error("APOD Failed:", res.status, await res.text());
        }
    } catch (e) {
        console.error("APOD Network Error:", e.message);
    }
}

async function testEPIC() {
    console.log("\nTesting EPIC API...");
    try {
        const res = await fetch(`https://api.nasa.gov/EPIC/api/natural?api_key=${API_KEY}`);
        if (res.ok) {
            console.log("EPIC Success:", res.status);
            const data = await res.json();
            console.log("Images Found:", data.length);
        } else {
            console.error("EPIC Failed:", res.status, await res.text());
        }
    } catch (e) {
        console.error("EPIC Network Error:", e.message);
    }
}

console.log(`Using API Key: ${API_KEY}`);
testAPOD().then(() => testEPIC());
