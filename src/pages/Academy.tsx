import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, CheckCircle, Award, Brain, Rocket, ChevronRight, RefreshCw, X, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

// --- 1. DATA STRUCTURE (THE CURRICULUM) ---
const COURSES = [
    // --- FOUNDATION PHASE (Levels 1-5) ---
    {
        id: 'module-1',
        title: 'Level 1: The Solar System',
        // ... (rest of COURSES remains unchanged, I will preserve it in the file, but for this replacement likely I need to match the top block)
        // Wait, replace_file_content replaces a BLOCK. I shouldn't replace the huge COURSES array if I can avoid it.
        // I will target the IMPORTS and the COMPONENT BODY separately.

        // Let's do imports first.

        description: 'Start here. accurate map of our celestial neighborhood.',
        videoTitle: 'Solar System 101',
        videoId: 'libKVRa01L8',
        thumbnail: 'https://img.youtube.com/vi/libKVRa01L8/maxresdefault.jpg',
        xpReward: 100, // Beginner Base
        quiz: [
            { question: "Which celestial body is at the center of the solar system?", options: ["Earth", "The Sun", "The Moon", "Sagittarius A*"], correct: 1 },
            { question: "Which planet is known as the Red Planet?", options: ["Venus", "Jupiter", "Mars", "Saturn"], correct: 2 },
            { question: "What is the largest planet in our solar system?", options: ["Earth", "Uranus", "Jupiter", "Saturn"], correct: 2 },
            { question: "How many moons does Earth have?", options: ["One", "Two", "Zero", "Twelve"], correct: 0 }
        ],
        flashcards: [
            { term: "Heliocentric", definition: "Model where planets orbit the Sun." },
            { term: "AU", definition: "Astronomical Unit: Distance from Earth to Sun." },
            { term: "Kuiper Belt", definition: "Ring of icy bodies beyond Neptune." },
            { term: "Oort Cloud", definition: "Theoretical shell of comets surrounding us." },
            { term: "Ecliptic", definition: "The plane of Earth's orbit around the Sun." }
        ]
    },
    {
        id: 'module-2',
        title: 'Level 2: The Moon',
        description: 'Our nearest neighbor and first destination.',
        videoTitle: 'The Moon 101',
        videoId: '6AviDjR9mmo',
        thumbnail: 'https://img.youtube.com/vi/6AviDjR9mmo/maxresdefault.jpg',
        xpReward: 150,
        quiz: [
            { question: "How far is the Moon from Earth?", options: ["384,400 km", "1,000,000 km", "10,000 km", "500 km"], correct: 0 },
            { question: "What causes tides on Earth?", options: ["The Sun", "The Moon's Gravity", "Earth's Rotation", "Wind"], correct: 1 },
            { question: "Which mission first landed humans on the Moon?", options: ["Apollo 1", "Apollo 11", "Gemini 4", "Artemis 1"], correct: 1 },
            { question: "Does the Moon have an atmosphere?", options: ["Yes, thick", "No, it's a vacuum (exosphere)", "Yes, breathable", "Yes, methane"], correct: 1 }
        ],
        flashcards: [
            { term: "Regolith", definition: "Layer of loose dust and rock covering the Moon." },
            { term: "Tidal Lock", definition: "Why we always see the same face of the Moon." },
            { term: "Mare", definition: "Dark basaltic plains on the Moon's surface." },
            { term: "Perigee", definition: "Point in orbit closest to Earth." },
            { term: "Artemis", definition: "NASA's program to return humans to the Moon." }
        ]
    },
    {
        id: 'module-3',
        title: 'Level 3: Stars',
        description: 'The nuclear engines that power the universe.',
        videoTitle: 'Life of a Star',
        videoId: 'PM9CQDlQI0A',
        thumbnail: 'https://img.youtube.com/vi/PM9CQDlQI0A/maxresdefault.jpg',
        xpReward: 200,
        quiz: [
            { question: "What fuels a star?", options: ["Coal", "Nuclear Fusion", "Fission", "Gasoline"], correct: 1 },
            { question: "What is our Sun classified as?", options: ["Red Giant", "White Dwarf", "Yellow Dwarf (G-Type)", "Blue Supergiant"], correct: 2 },
            { question: "How will the Sun end?", options: ["Supernova", "Black Hole", "White Dwarf", "It won't"], correct: 2 },
            { question: "What is a Supernova?", options: ["A baby star", "A dying star explosion", "A galaxy collision", "A comet"], correct: 1 }
        ],
        flashcards: [
            { term: "Fusion", definition: "Process of combining atoms to release energy." },
            { term: "Photosphere", definition: "The visible surface of a star." },
            { term: "Red Giant", definition: "A dying star in its final stages." },
            { term: "Nebula", definition: "A giant cloud of dust and gas in space." },
            { term: "Main Sequence", definition: "Stable period of a star's lifecycle." }
        ]
    },
    {
        id: 'module-4',
        title: 'Level 4: Astronauts',
        description: 'The human element. What it takes to survive.',
        videoTitle: 'Astronaut Training',
        videoId: '3M3F320uYyY',
        thumbnail: 'https://img.youtube.com/vi/3M3F320uYyY/maxresdefault.jpg',
        xpReward: 250,
        quiz: [
            { question: "What is 'G-Force'?", options: ["Gravity Force", "Galactic Force", "Ground Force", "Gas Force"], correct: 0 },
            { question: "What happens to bones in space?", options: ["They get stronger", "They lose density", "Nothing", "They grow longer"], correct: 1 },
            { question: "What is an EVA?", options: ["Extra Vehicular Activity", "Eating Vacuum Air", "Every Vehicle Access", "Energy Volt Amp"], correct: 0 },
            { question: "Do astronauts grow taller in space?", options: ["No", "Yes, slightly", "They shrink", "They double in size"], correct: 1 }
        ],
        flashcards: [
            { term: "Microgravity", definition: "Condition of weightlessness in orbit." },
            { term: "EVA", definition: "Spacewalk outside the vehicle." },
            { term: "Hypoxia", definition: "Oxygen deficiency in the body." },
            { term: "Payload", definition: "Cargo carried by a spacecraft." },
            { term: "G-Suit", definition: "Suit preventing blood pooling during launch." }
        ]
    },
    {
        id: 'module-5',
        title: 'Level 5: The ISS',
        description: 'Living off-world. A laboratory in the sky.',
        videoTitle: 'Inside the ISS',
        videoId: 'SGP6Y0Pnhe4',
        thumbnail: 'https://img.youtube.com/vi/SGP6Y0Pnhe4/maxresdefault.jpg',
        xpReward: 300,
        quiz: [
            { question: "What does ISS stand for?", options: ["International Space Station", "Internal Star Ship", "Indian Space Shuttle", "Ion Star System"], correct: 0 },
            { question: "How fast does the ISS orbit?", options: ["1,000 km/h", "28,000 km/h", "500 km/h", "Mach 1"], correct: 1 },
            { question: "How many sunsets do astronauts see per day?", options: ["One", "Sixteen", "Four", "None"], correct: 1 },
            { question: "Who operates the ISS?", options: ["NASA only", "SpaceX", "International partnership", "China"], correct: 2 }
        ],
        flashcards: [
            { term: "Modules", definition: "Pressurized sections of the station." },
            { term: "Cupola", definition: "The 7-window observatory deck." },
            { term: "Docking", definition: "Joining two spacecraft in orbit." },
            { term: "Truss", definition: "Structural backbone of the ISS." },
            { term: "Solar Arrays", definition: "Wings that convert sunlight to power." }
        ]
    },

    // --- EXPANSION PHASE (Levels 6-10) ---
    {
        id: 'module-6',
        title: 'Level 6: Rocket Science',
        description: 'Orbital mechanics and propulsion physics.',
        videoTitle: 'SpaceX Launch Logic',
        videoId: 'OnoNITE-CLc',
        thumbnail: 'https://img.youtube.com/vi/OnoNITE-CLc/maxresdefault.jpg',
        xpReward: 400, // Difficulty Jump
        quiz: [
            { question: "What is the primary force rockets must overcome?", options: ["Magnetism", "Gravity", "Friction", "Inertia"], correct: 1 },
            { question: "What entails Newton's Third Law?", options: ["Action & Reaction", "Inertia", "F=ma", "Thermodynamics"], correct: 0 },
            { question: "What fuel does the Starship use?", options: ["Kerosene", "Liquid Hydrogen", "Methalox", "Nuclear Pulse"], correct: 2 },
            { question: "What is 'Max Q'?", options: ["Maximum Quiet", "Maximum Dynamic Pressure", "Maximum Quickness", "Maximum Quality"], correct: 1 }
        ],
        flashcards: [
            { term: "Thrust", definition: "Force that propels a rocket skyward." },
            { term: "Delta-V", definition: "Measure of the impulse needed to change orbit." },
            { term: "Stage Separation", definition: "Discarding used rocket parts to shed weight." },
            { term: "Apogee", definition: "Highest point of an orbit." },
            { term: "Specific Impulse", definition: "Efficiency of a rocket engine (MPG for space)." }
        ]
    },
    {
        id: 'module-7',
        title: 'Level 7: Mars Colonization',
        description: 'The first step to becoming multi-planetary.',
        videoTitle: 'How We Will live on Mars',
        videoId: 't9c7aheZxls',
        thumbnail: 'https://img.youtube.com/vi/t9c7aheZxls/maxresdefault.jpg',
        xpReward: 500,
        quiz: [
            { question: "What is the length of a day on Mars?", options: ["24h 37m", "10h", "100h", "24h exactly"], correct: 0 },
            { question: "What is the main gas in Mars' atmosphere?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Helium"], correct: 2 },
            { question: "Why is Mars red?", options: ["Iron Oxide (Rust)", "Copper", "Heat", "Red Plants"], correct: 0 },
            { question: "Which rover landed in 2021?", options: ["Curiosity", "Perseverance", "Spirit", "Viking"], correct: 1 }
        ],
        flashcards: [
            { term: "Terraforming", definition: "Hypothetical process of making a planet habitable." },
            { term: "Olympus Mons", definition: "Largest volcano in the solar system (on Mars)." },
            { term: "Sol", definition: "A solar day on Mars (24h 39m)." },
            { term: "Perchlorates", definition: "Toxic salts found in Martian soil." },
            { term: "Valles Marineris", definition: "Grand Canyon of Mars, 4000km long." }
        ]
    },
    {
        id: 'module-8',
        title: 'Level 8: Exoplanets',
        description: 'Strange new worlds beyond our star.',
        videoTitle: 'Exoplanets 101',
        videoId: '7a0hBW4h704',
        thumbnail: 'https://img.youtube.com/vi/7a0hBW4h704/maxresdefault.jpg',
        xpReward: 600,
        quiz: [
            { question: "What is an exoplanet?", options: ["A planet in our system", "A planet orbiting another star", "A rogue planet", "A moon"], correct: 1 },
            { question: "What is the 'Goldilocks Zone'?", options: ["Too hot", "Too cold", "Just right for water", "Full of gold"], correct: 2 },
            { question: "How do we detect most exoplanets?", options: ["Direct imaging", "Transit Method", "Radar", "Sonar"], correct: 1 },
            { question: "What was the first exoplanet discovered?", options: ["Kepler-22b", "51 Pegasi b", "Proxima b", "TRAPPIST-1e"], correct: 1 }
        ],
        flashcards: [
            { term: "Habitable Zone", definition: "Region where liquid water can exist." },
            { term: "Super-Earth", definition: "Planet with mass higher than Earth but lower than ice giants." },
            { term: "Transit", definition: "When a planet passes in front of its star." },
            { term: "Light Year", definition: "Distance light travels in one year (approx 9.46 trillion km)." },
            { term: "Hot Jupiter", definition: "Gas giant orbiting very close to its star." }
        ]
    },
    {
        id: 'module-9',
        title: 'Level 9: Galaxies',
        description: 'Cosmic structures and the scale of the universe.',
        videoTitle: 'Galaxies Explained',
        videoId: 'I82ADyW7hZE',
        thumbnail: 'https://img.youtube.com/vi/I82ADyW7hZE/maxresdefault.jpg',
        xpReward: 750,
        quiz: [
            { question: "What galaxy are we in?", options: ["Andromeda", "Triangulum", "Milky Way", "Whirlpool"], correct: 2 },
            { question: "What is the shape of the Milky Way?", options: ["Elliptical", "Spiral", "Irregular", "Square"], correct: 1 },
            { question: "What holds galaxies together?", options: ["Electricity", "Dark Matter & Gravity", "Magnetism", "Glue"], correct: 1 },
            { question: "What is at the center of most galaxies?", options: ["A Star", "A Supermassive Black Hole", "A Planet", "A Void"], correct: 1 }
        ],
        flashcards: [
            { term: "Milky Way", definition: "Our spiral galaxy containing 100-400 billion stars." },
            { term: "Andromeda", definition: "Our nearest major galactic neighbor." },
            { term: "Local Group", definition: "Cluster of galaxies including ours." },
            { term: "Dark Matter", definition: "Invisible mass holding galaxies together." },
            { term: "Supermassive Black Hole", definition: "Giant black hole at a galaxy's center." }
        ]
    },
    {
        id: 'module-10',
        title: 'Level 10: Search for Life',
        description: 'Astrobiology and the Drake Equation.',
        videoTitle: 'Are We Alone?',
        videoId: 'sNhhvQGsMEc',
        thumbnail: 'https://img.youtube.com/vi/sNhhvQGsMEc/maxresdefault.jpg',
        xpReward: 900,
        quiz: [
            { question: "What is SETI?", options: ["Search for Extraterrestrial Intelligence", "Space Eating Tiny Insects", "Star Energy Total Index", "Send E-mail To ISS"], correct: 0 },
            { question: "What is the Drake Equation?", options: ["Calculates rocket fuel", "Estimates active civilizations", "Measures gravity", "Cooks stellar food"], correct: 1 },
            { question: "What is a 'biosignature'?", options: ["An alien autograph", "Evidence of life in atmosphere", "A planet's color", "A radio signal"], correct: 1 },
            { question: "Where in our solar system might life exist?", options: ["Sun", "Europa (Moon of Jupiter)", "Mercury", "Pluto"], correct: 1 }
        ],
        flashcards: [
            { term: "Biosignature", definition: "A gas or phenomenon indicating life (e.g., Oxygen, Methane)." },
            { term: "SETI", definition: "Search for Extraterrestrial Intelligence via radio waves." },
            { term: "Europa", definition: "Moon of Jupiter likely hosting a subsurface ocean." },
            { term: "Extremophile", definition: "Lifeforms thriving in extreme heat, cold, or acid." },
            { term: "Panspermia", definition: "Theory that life spreads between planets via meteors." }
        ]
    },

    // --- DEEP THEORY PHASE (Levels 11-15) ---
    {
        id: 'module-11',
        title: 'Level 11: Black Holes',
        description: 'Extreme gravity and the warping of reality.',
        videoTitle: 'Black Holes Explained',
        videoId: 'qGHonp262Ns',
        thumbnail: 'https://img.youtube.com/vi/qGHonp262Ns/maxresdefault.jpg',
        xpReward: 1000, // Major Milestone
        quiz: [
            { question: "What is the boundary of a black hole called?", options: ["Event Horizon", "Singularity", "Exit Strategy", "Photon Sphere"], correct: 0 },
            { question: "What happens to time near a black hole?", options: ["It speeds up", "It stops completely", "It slows down (dilation)", "It moves backwards"], correct: 2 },
            { question: "What is at the very center of a black hole?", options: ["Another Universe", "A Singularity", "Dark Matter", "A Neutron Star"], correct: 1 },
            { question: "Can light escape a black hole?", options: ["Yes, sometimes", "No, never", "Only UV light", "Only if it is fast enough"], correct: 1 }
        ],
        flashcards: [
            { term: "Event Horizon", definition: "Point of no return where escape velocity exceeds light speed." },
            { term: "Singularity", definition: "Center point of infinite density and gravity." },
            { term: "Spaghettification", definition: "Stretching of objects by tidal forces." },
            { term: "Accretion Disk", definition: "Glowing ring of matter spiraling into the hole." },
            { term: "Hawking Radiation", definition: "Theoretical radiation emitted by black holes." }
        ]
    },
    {
        id: 'module-12',
        title: 'Level 12: The Big Bang',
        description: 'Cosmogenesis and the dawn of time.',
        videoTitle: 'The Big Bang Theory',
        videoId: 'wNDGgL73ihY',
        thumbnail: 'https://img.youtube.com/vi/wNDGgL73ihY/maxresdefault.jpg',
        xpReward: 1250,
        quiz: [
            { question: "How old is the universe?", options: ["4.5 Billion Years", "13.8 Billion Years", "1 Trillion Years", "2000 Years"], correct: 1 },
            { question: "What was the universe like initially?", options: ["Cold and empty", "Hot and dense", "Full of stars", "Watery"], correct: 1 },
            { question: "What is CMB?", options: ["Cosmic Microwave Background", "Colors of Mars Base", "Cold Moon Base", "Comet Motion B"], correct: 0 },
            { question: "Is the universe expanding?", options: ["No, it's static", "Yes, and accelerating", "Yes, but slowing", "No, shrinking"], correct: 1 }
        ],
        flashcards: [
            { term: "Big Bang", definition: "Rapid expansion of the universe from a singular point." },
            { term: "Cosmic Inflation", definition: "Exponential expansion of space in early universe." },
            { term: "CMB", definition: "Cosmic Microwave Background: Afterglow of creation." },
            { term: "Redshift", definition: "Stretching of light waves as objects move away." },
            { term: "Dark Energy", definition: "Mysterious force driving accelerated expansion." }
        ]
    },
    {
        id: 'module-13',
        title: 'Level 13: Dark Matter',
        description: 'The invisible 85% of the universe.',
        videoTitle: 'Dark Matter Explained',
        videoId: 'Hneq66t8W6g',
        thumbnail: 'https://img.youtube.com/vi/Hneq66t8W6g/maxresdefault.jpg',
        xpReward: 1500,
        quiz: [
            { question: "How much of the universe is Dark Matter?", options: ["5%", "27%", "68%", "100%"], correct: 1 },
            { question: "Does Dark Matter interact with light?", options: ["Yes", "No", "Sometimes", "Only blue light"], correct: 1 },
            { question: "How do we know it exists?", options: ["We saw it", "Gravitational effects", "Someone told us", "Magic"], correct: 1 },
            { question: "Is Dark Energy the same as Dark Matter?", options: ["Yes", "No", "Maybe", "They are opposites"], correct: 1 }
        ],
        flashcards: [
            { term: "WIMP", definition: "Weakly Interacting Massive Particle (Dark Matter candidate)." },
            { term: "Gravitational Lensing", definition: "Bending of light by massive invisible objects." },
            { term: "Baryonic Matter", definition: "Normal matter (protons/neutrons) - only 5% of universe." },
            { term: "Galaxy Rotation", definition: "Stars move too fast, implying hidden mass (Dark Matter)." },
            { term: "Void", definition: "Empty spaces between galaxy filaments." }
        ]
    },
    {
        id: 'module-14',
        title: 'Level 14: Relativity',
        description: 'Einstein, Time Dilation, and Spacetime.',
        videoTitle: 'Relativity 101',
        videoId: '0iJZ_QGMLD0',
        thumbnail: 'https://img.youtube.com/vi/0iJZ_QGMLD0/maxresdefault.jpg',
        xpReward: 2000,
        quiz: [
            { question: "Who proposed General Relativity?", options: ["Newton", "Einstein", "Galileo", "Hawking"], correct: 1 },
            { question: "Does gravity bend light?", options: ["No", "Yes (Gravitational Lensing)", "Only red light", "Impossible"], correct: 1 },
            { question: "What is Time Dilation?", options: ["Time stopping", "Time slowing down near gravity/speed", "Time travel", "Clock breaking"], correct: 1 },
            { question: "What is the speed limit of the universe?", options: ["Sound", "Light", "Infinity", "100 mph"], correct: 1 }
        ],
        flashcards: [
            { term: "Spacetime", definition: "The 4D fabric of the universe (3D space + time)." },
            { term: "Time Dilation", definition: "Time moves slower near massive gravity." },
            { term: "E=mc²", definition: "Energy equals mass times speed of light squared." },
            { term: "Wormhole", definition: "Theoretical shortcut through spacetime." },
            { term: "Twin Paradox", definition: "Space traveler ages slower than twin on Earth." }
        ]
    },
    {
        id: 'module-15',
        title: 'Level 15: Future Tech',
        description: 'Warp Drives, Dyson Spheres, and The Future.',
        videoTitle: 'Future Space Tech',
        videoId: 'uXqUeMyWMxg',
        thumbnail: 'https://img.youtube.com/vi/uXqUeMyWMxg/maxresdefault.jpg',
        xpReward: 3000, // Maximum Reward
        quiz: [
            { question: "What is a Dyson Sphere?", options: ["A vacuum cleaner", "Structure around a star to harvest energy", "A ball game", "A planet"], correct: 1 },
            { question: "What is 'Terraforming'?", options: ["Mining Earth", "Making a planet Earth-like", "Destroying a planet", "Farming"], correct: 1 },
            { question: "What uses antimatter?", options: ["Cars", "Potential Warp Drives", "Toasters", "Phones"], correct: 1 },
            { question: "Is faster-than-light travel possible yet?", options: ["Yes, we do it daily", "No, theoretically difficult", "Easy", "Only for NASA"], correct: 1 }
        ],
        flashcards: [
            { term: "Dyson Sphere", definition: "Megastructure capturing a star's entire energy output." },
            { term: "Antimatter", definition: "Matter with opposite charge; releases pure energy." },
            { term: "Kardashev Scale", definition: "Ranking civilizations by energy consumption." },
            { term: "Von Neumann Probe", definition: "Self-replicating spacecraft." },
            { term: "Warp Drive", definition: "Theoretical propulsion bending spacetime itself." }
        ]
    }
];



export const Academy = () => {
    const { user } = useAuth();
    // --- 2. STATE MANAGEMENT ---
    const [activeCourseId, setActiveCourseId] = useState<string>(COURSES[0].id);
    const [quizMode, setQuizMode] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    // Persistent Data (Synced with Firestore)
    const [userXP, setUserXP] = useState(0);
    const [completedCourses, setCompletedCourses] = useState<string[]>([]);

    // Loading State for Sync
    const [isSyncing, setIsSyncing] = useState(true);

    // Sync with Firestore
    useEffect(() => {
        if (!user) {
            setIsSyncing(false);
            return;
        }

        const userRef = doc(db, 'users', user.uid);
        const unsubscribe = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.academy) {
                    setUserXP(data.academy.xp || 0);
                    setCompletedCourses(data.academy.completedCourses || []);
                }
            }
            setIsSyncing(false);
        });

        return () => unsubscribe();
    }, [user]);

    // Quiz State
    const [quizScore, setQuizScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

    const activeCourse = useMemo(() => COURSES.find(c => c.id === activeCourseId) || COURSES[0], [activeCourseId]);

    // Rank Calculation
    const userRank = useMemo(() => {
        if (userXP >= 10000) return "Grand Admiral";
        if (userXP >= 5000) return "Cosmic Legend";
        if (userXP >= 2500) return "Commander";
        if (userXP >= 1000) return "Captain";
        if (userXP >= 300) return "Explorer";
        return "Rookie";
    }, [userXP]);

    // Progress
    const progress = Math.min((userXP / 12000) * 100, 100);

    // --- HANDLERS ---
    const handleStartQuiz = () => {
        setQuizMode(true);
        setCurrentQuestionIndex(0);
        setQuizScore(0);
        setShowResult(false);
        setSelectedAnswer(null);
    };

    const handleAnswer = (optionIndex: number) => {
        setSelectedAnswer(optionIndex);

        // Brief delay to show selection before moving on
        setTimeout(() => {
            const isCorrect = optionIndex === activeCourse.quiz[currentQuestionIndex].correct;
            // Optimistic update for consistency
            const newScore = isCorrect ? quizScore + 1 : quizScore;
            if (isCorrect) setQuizScore(prev => prev + 1);

            if (currentQuestionIndex < activeCourse.quiz.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
                setSelectedAnswer(null);
            } else {
                setShowResult(true);
                handleQuizComplete(newScore);
            }
        }, 800);
    };

    // Helper to Save Progress
    const saveProgress = async (xpReward: number, courseId: string) => {
        if (!user) return;

        try {
            const userRef = doc(db, 'users', user.uid);
            // Calculate new state based on current (safe assumption for now, or use transaction)
            const newXP = userXP + xpReward;
            const newCompleted = [...completedCourses, courseId];

            await setDoc(userRef, {
                academy: {
                    xp: newXP,
                    completedCourses: newCompleted,
                    lastPlayed: new Date().toISOString()
                }
            }, { merge: true });
        } catch (error) {
            console.error("Failed to save progress:", error);
        }
    };

    const handleQuizComplete = (newScore: number) => {
        // This logic was inside handleAnswer, extracting/modifying inline
        const totalQuestions = activeCourse.quiz.length;
        const percentage = (newScore / totalQuestions) * 100;

        if (percentage >= 70) {
            if (!completedCourses.includes(activeCourse.id)) {
                // FIREBASE SAVE
                saveProgress(activeCourse.xpReward, activeCourse.id);
                // Local optimism handled by onSnapshot, but we can animate confetti immediately
                // setUserXP(prev => prev + activeCourse.xpReward); // relying on snapshot for state update
                // setCompletedCourses(prev => [...prev, activeCourse.id]); 
            }
            // CELEBRATION!
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#22d3ee', '#a855f7', '#f0f9ff']
            });
        }
    }

    const handleRetry = () => {
        setQuizMode(false);
        setShowResult(false);
        setCurrentQuestionIndex(0);
    };

    return (
        <div className="h-full bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-white font-sans selection:bg-emerald-500/30 flex flex-col md:flex-row overflow-hidden relative">
            {/* --- LEFT SIDEBAR (MISSION LOG) */}
            <motion.aside
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-full md:w-80 border-r border-slate-700/50 bg-slate-900/80 backdrop-blur-md flex flex-col z-10"
            >
                <div className="p-6 border-b border-slate-700/50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-lg shadow-cyan-500/20">
                            <Award className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold tracking-wider text-white">CADET PROFILE</h2>
                            <p className="text-xs text-cyan-400 font-mono tracking-widest uppercase">{userRank}</p>
                        </div>
                    </div>

                    {/* XP Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-slate-400 font-mono">
                            <span>XP: {userXP}</span>
                            <span>TARGET: 12000</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                            <motion.div
                                className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ type: "spring", bounce: 0, duration: 1 }}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 px-2">Training Modules</h3>
                    {COURSES.map((course, index) => {
                        const isActive = activeCourseId === course.id;
                        const isCompleted = completedCourses.includes(course.id);

                        // Strict sequential locking: Locked if previous index is NOT in completed list
                        // Level 1 (Index 0) is always unlocked
                        const isLocked = index > 0 && !completedCourses.includes(COURSES[index - 1].id);

                        return (
                            <motion.button
                                key={course.id}
                                onClick={() => !isLocked && (setActiveCourseId(course.id), setQuizMode(false))}
                                disabled={isLocked}
                                whileHover={!isLocked ? { scale: 1.02, backgroundColor: 'rgba(30, 41, 59, 0.8)' } : {}}
                                whileTap={!isLocked ? { scale: 0.98 } : {}}
                                className={`w-full text-left p-3 rounded-xl border transition-all duration-300 relative group ${isActive
                                    ? 'bg-slate-800/80 border-cyan-500/50 shadow-lg shadow-cyan-900/20'
                                    : isLocked ? 'bg-slate-900/20 border-slate-800 opacity-50 cursor-not-allowed' : 'bg-slate-900/40 border-slate-700/30 hover:border-slate-600'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {isLocked ? (
                                            <div className="p-1.5 rounded-full bg-slate-800 text-slate-600 border border-slate-700">
                                                <div className="w-4 h-4 flex items-center justify-center font-bold text-[10px]">🔒</div>
                                            </div>
                                        ) : isCompleted ? (
                                            <div className="p-1.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                                                <CheckCircle size={16} />
                                            </div>
                                        ) : (
                                            <div className={`p-1.5 rounded-full border ${isActive ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                                                <Play size={16} fill={isActive && !isCompleted ? "currentColor" : "none"} />
                                            </div>
                                        )}
                                        <div>
                                            <h4 className={`text-sm font-medium ${isActive ? 'text-cyan-100' : isLocked ? 'text-slate-600' : 'text-slate-400'}`}>{course.title}</h4>
                                            {!isLocked && <p className="text-[10px] text-slate-500 font-mono">REWARD: {course.xpReward} XP</p>}
                                        </div>
                                    </div>
                                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />}
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            </motion.aside>

            {/* --- MAIN AREA (THE LEARNING LAB) --- */}
            <main className="flex-1 flex flex-col overflow-y-auto relative z-10 bg-[url('/grid-pattern.svg')]">
                {/* Initial Sync Loading State */}
                {isSyncing && (
                    <div className="absolute inset-0 bg-slate-900/90 z-50 flex items-center justify-center">
                        <div className="text-cyan-400 font-mono animate-pulse tracking-widest">SYNCING PROFILE DATA...</div>
                    </div>
                )}

                {/* Enhanced Header */}
                <header className="p-6 md:p-8 border-b border-white/10 backdrop-blur-md bg-slate-900/90 sticky top-0 z-20">
                    <div className="max-w-6xl mx-auto w-full">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 tracking-widest uppercase">
                                <span className="opacity-50">ACADEMY</span>
                                <ChevronRight size={10} />
                                <span className="opacity-75">TRAINING MODULES</span>
                                <ChevronRight size={10} />
                                <span className="text-white font-bold">{activeCourse.id.replace('module-', 'LEVEL ')}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="px-3 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    SYSTEM ONLINE
                                </div>
                                <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded bg-blue-500/10 border border-blue-500/20">
                                    <Rocket className="w-3 h-3 text-blue-400" />
                                    <span className="text-xs font-mono text-blue-300">UPLINK_ESTABLISHED</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start justify-between">
                            <div>
                                <motion.h1
                                    key={activeCourse.id}
                                    initial={{ y: -10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="text-3xl md:text-4xl font-bold font-orbitron text-white uppercase tracking-wider mb-2 flex items-center gap-3"
                                >
                                    {activeCourse.title}
                                </motion.h1>
                                <div className="flex items-center gap-4 text-sm text-slate-400">
                                    <span className="flex items-center gap-1"><Brain size={14} className="text-purple-400" /> Learning Objective: Cosmic Awareness</span>
                                    <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                    <span className="flex items-center gap-1"><Zap size={14} className="text-yellow-400" /> Est. Time: 15m</span>
                                </div>
                            </div>
                            {/* Mini Progress for this module */}
                            <div className="hidden lg:block text-right">
                                <div className="flex flex-col items-end">
                                    <p className="text-[10px] text-slate-500 font-mono uppercase mb-1">MODULE REWARD</p>
                                    <div className="flex items-center gap-2">
                                        <div className="text-2xl font-bold text-cyan-400">+{activeCourse.xpReward}</div>
                                        <span className="text-xs font-bold text-cyan-500/50">XP</span>
                                    </div>
                                </div>
                            </div>
                        </div>


                    </div>
                </header>

                <div className="p-6 md:p-8 flex-1 flex flex-col w-full max-w-7xl mx-auto">
                    {/* VIDEO / QUIZ CONTAINER - Reduced Width & Padding */}
                    <div className="w-full max-w-4xl mx-auto mt-1.5 mb-4 px-6">
                        <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-slate-700/50 ring-1 ring-cyan-500/10 shadow-[0_0_40px_rgba(8,145,178,0.1)] group">
                            <AnimatePresence mode="wait">
                                {!quizMode ? (
                                    <motion.div
                                        key="video"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="w-full h-full"
                                    >
                                        <iframe
                                            className="w-full h-full"
                                            src={`https://www.youtube.com/embed/${activeCourse.videoId}?rel=0&modestbranding=1`}
                                            title={activeCourse.videoTitle}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="quiz"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.05 }}
                                        className="w-full h-full bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-6 relative"
                                    >
                                        {/* Close Quiz Button */}
                                        <button onClick={handleRetry} className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                                            <X size={20} />
                                        </button>

                                        {!showResult ? (
                                            <div className="max-w-2xl w-full">
                                                <div className="flex justify-between items-center mb-6 text-xs font-mono text-cyan-500/80 uppercase tracking-widest">
                                                    <span>Question {currentQuestionIndex + 1} / {activeCourse.quiz.length}</span>
                                                    <span>Module Evaluation</span>
                                                </div>

                                                <h3 className="text-xl md:text-2xl font-bold text-white mb-8 leading-relaxed">
                                                    {activeCourse.quiz[currentQuestionIndex].question}
                                                </h3>

                                                <div className="space-y-3">
                                                    {activeCourse.quiz[currentQuestionIndex].options.map((option, idx) => (
                                                        <motion.button
                                                            key={idx}
                                                            onClick={() => handleAnswer(idx)}
                                                            whileHover={{ scale: 1.01, x: 4 }}
                                                            whileTap={{ scale: 0.99 }}
                                                            disabled={selectedAnswer !== null}
                                                            className={`w-full p-4 rounded-lg border text-left transition-all duration-200 flex items-center justify-between group ${selectedAnswer === idx
                                                                ? idx === activeCourse.quiz[currentQuestionIndex].correct
                                                                    ? 'bg-green-500/20 border-green-500 text-green-100'
                                                                    : 'bg-red-500/20 border-red-500 text-red-100'
                                                                : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-50'
                                                                }`}
                                                        >
                                                            <span className="flex items-center gap-3">
                                                                <span className="w-6 h-6 rounded flex items-center justify-center border border-white/10 text-xs font-mono bg-black/20 text-slate-400 group-hover:border-cyan-500/30 group-hover:text-cyan-400 transition-colors">
                                                                    {String.fromCharCode(65 + idx)}
                                                                </span>
                                                                {option}
                                                            </span>
                                                            {selectedAnswer === idx && (
                                                                idx === activeCourse.quiz[currentQuestionIndex].correct
                                                                    ? <CheckCircle className="text-green-400" size={18} />
                                                                    : <X className="text-red-400" size={18} />
                                                            )}
                                                        </motion.button>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <div className="mb-6 inline-block">
                                                    {((quizScore / activeCourse.quiz.length) * 100) >= 70 ? (
                                                        <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center border-2 border-green-500 mb-4 mx-auto animate-bounce">
                                                            <Award size={40} />
                                                        </div>
                                                    ) : (
                                                        <div className="w-20 h-20 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center border-2 border-red-500 mb-4 mx-auto">
                                                            <X size={40} />
                                                        </div>
                                                    )}
                                                    <h3 className="text-3xl font-bold text-white mb-2">
                                                        {((quizScore / activeCourse.quiz.length) * 100) >= 70 ? "MISSION ACCOMPLISHED" : "CRITICAL FAILURE"}
                                                    </h3>
                                                    <p className="text-slate-400">You scored {quizScore} out of {activeCourse.quiz.length}</p>
                                                </div>

                                                {((quizScore / activeCourse.quiz.length) * 100) >= 70 ? (
                                                    <div className="p-4 bg-cyan-950/30 border border-cyan-500/30 rounded-lg max-w-sm mx-auto mb-8">
                                                        <p className="text-cyan-400 font-mono text-sm uppercase mb-1">Rewards Earned</p>
                                                        <p className="text-2xl font-bold text-white">+{activeCourse.xpReward} XP</p>
                                                    </div>
                                                ) : (
                                                    <div className="p-4 bg-red-950/30 border border-red-500/30 rounded-lg max-w-sm mx-auto mb-8">
                                                        <p className="text-red-400 font-mono text-sm uppercase">Cadet Training Incomplete (Wait 70% Accuracy)</p>
                                                    </div>
                                                )}

                                                <button
                                                    onClick={handleRetry}
                                                    className="px-8 py-3 bg-white text-slate-900 font-bold rounded hover:bg-cyan-50 transition-colors flex items-center gap-2 mx-auto"
                                                >
                                                    {((quizScore / activeCourse.quiz.length) * 100) >= 70 ? (
                                                        <>Continue Training <ChevronRight size={18} /></>
                                                    ) : (
                                                        <>Retry Module <RefreshCw size={18} /></>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Action Bar */}
                        {/* Action Area - Directly Below Video */}
                        {/* Action Area - Directly Below Video */}
                        <div className="flex justify-center mt-1.5 mb-12">
                            {!quizMode ? (
                                <motion.button
                                    onClick={handleStartQuiz}
                                    whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(16,185,129,0.6)" }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold tracking-wide rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center gap-3 border border-white/10 hover:border-emerald-400 group transition-all duration-300"
                                >
                                    <Brain className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                    TAKE CERTIFICATION EXAM
                                    <ChevronRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
                                </motion.button>
                            ) : (
                                <div className="text-center">
                                    <span className="text-xs font-mono text-emerald-500 animate-pulse">EXAM MODE ACTIVE // DO NOT CLOSE TERMINAL</span>
                                </div>
                            )}
                        </div>

                        {/* --- FLASHCARD FLUX (QUICK-FIRE FACTS) --- */}
                        <div className="border-t border-slate-700/50 pt-8">
                            <div className="flex items-center gap-2 mb-6">
                                <RefreshCw className="w-4 h-4 text-purple-400" />
                                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Flashcard Flux</h3>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {(activeCourse.flashcards || []).map((card, idx) => (
                                    <FlashCard key={idx} term={card.term} definition={card.definition} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div >
    );
};

const FlashCard = ({ term, definition }: { term: string, definition: string }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div
            className="group h-48 perspective-1000 cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
            onMouseLeave={() => setIsFlipped(false)}
        >
            <motion.div
                className="relative w-full h-full transition-all duration-700 transform-style-3d shadow-xl"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
            >
                {/* Front */}
                <div className="absolute w-full h-full backface-hidden bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-xl flex flex-col items-center justify-center p-6 text-center hover:border-emerald-500/30 transition-colors group-hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                    <div className="mb-3 p-3 bg-white/5 rounded-full text-emerald-400 border border-white/5 group-hover:scale-110 transition-transform duration-500">
                        <Zap size={20} />
                    </div>
                    <span className="text-white font-bold font-orbitron tracking-wider text-sm uppercase">{term}</span>
                    <p className="text-[10px] text-slate-500 mt-2 font-mono">TAP TO REVEAL</p>
                </div>

                {/* Back */}
                <div className="absolute w-full h-full backface-hidden bg-slate-950 border border-emerald-500/30 rounded-xl flex items-center justify-center p-6 text-center rotate-y-180 shadow-[inset_0_0_30px_rgba(16,185,129,0.1)]">
                    <span className="text-emerald-100/80 text-xs leading-relaxed font-mono">{definition}</span>
                </div>
            </motion.div>
        </div>
    );
}

export default Academy;
