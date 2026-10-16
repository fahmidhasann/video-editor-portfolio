/*
  Portfolio content. Order here = order on the page.
  Every project plays inside the site:
    image   : poster / thumbnail
    preview : short muted loop shown on the card (assets/video/*-preview.mp4)
    video   : full video opened in the player (assets/video/*.mp4)
    url     : original post (shown as "Watch on Facebook" in the player)

  films  : 16:9 personal films
  motion : 16:9 motion design / brand films
  reels  : 9:16 client reels
*/
window.PORTFOLIO = {
  films: [
    {
      title: "BAU — The Way You've Never Seen It",
      category: "Campus Film",
      description: "Bangladesh Agricultural University, showcased like never before.",
      image: "assets/project_1.jpg",
      preview: "assets/video/film1-preview.mp4",
      video: "assets/video/film1/master.m3u8",
      url: "https://www.facebook.com/watch/?v=769200925475489"
    },
    {
      title: "Bivrom",
      category: "Short Film",
      description: "A cinematic exploration of life's complexities and choices.",
      image: "assets/project_2.jpg",
      preview: "assets/video/film2-preview.mp4",
      video: "assets/video/film2/master.m3u8",
      url: "https://www.facebook.com/fahmiddhasann/videos/2089556841420087"
    },
    {
      title: "Shimul",
      category: "AI Short Film",
      description: "A 78-second narrative, storyboarded and generated with Google Flow.",
      image: "assets/project_4.jpg",
      preview: "assets/video/film4-preview.mp4",
      video: "assets/video/film4/master.m3u8",
      url: "https://www.facebook.com/reel/1234951018536781"
    },
    {
      title: "Algorithm of Life",
      category: "Short Film",
      description: "Your choices define your life's algorithm.",
      image: "assets/project_3.jpg",
      preview: "assets/video/film3-preview.mp4",
      video: "assets/video/film3/master.m3u8",
      url: "https://www.facebook.com/fahmiddhasann/videos/1470028527301962"
    },
    {
      title: "বিশ্বস্ত মরীচিকা",
      category: "AI Short Film",
      description: "A narrative AI film about trust, perception, and reality.",
      image: "assets/project_5.jpg",
      preview: "assets/video/film5-preview.mp4",
      video: "assets/video/film5/master.m3u8",
      url: "https://www.facebook.com/reel/1383964689934673"
    }
  ],

  motion: [
    {
      title: "Onnoy — Connecting Necessary Dots",
      category: "Brand Film · Bangla",
      description: "A youth-led education initiative, told through type, data and motion.",
      image: "assets/motion/onnoy.jpg",
      preview: "assets/video/motion1-preview.mp4",
      video: "assets/video/motion1/master.m3u8",
      url: "https://www.facebook.com/reel/2913225312367215"
    },
    {
      title: "Craftly — In One Video",
      category: "Product Explainer",
      description: "Workspace, Robot and Cloud, explained in 45 seconds.",
      image: "assets/motion/craftly.jpg",
      preview: "assets/video/motion2-preview.mp4",
      video: "assets/video/motion2/master.m3u8",
      url: "https://www.facebook.com/reel/1155787417015475"
    }
  ],

  reels: [
    {
      title: "Built Different. Move Different.",
      client: "Sajjad Hossain Snigdho",
      image: "assets/client/reel_1042219817454072.jpg",
      preview: "assets/video/reel1-preview.mp4",
      video: "assets/video/reel1/master.m3u8",
      url: "https://www.facebook.com/reel/1042219817454072"
    },
    {
      title: "One Run at a Time",
      client: "Sajjad Hossain Snigdho",
      image: "assets/client/reel_438344139340070.jpg",
      preview: "assets/video/reel2-preview.mp4",
      video: "assets/video/reel2/master.m3u8",
      url: "https://www.facebook.com/reel/438344139340070"
    },
    {
      title: "For New Runners",
      client: "Sajjad Hossain Snigdho",
      image: "assets/client/reel_1245324753666981.jpg",
      preview: "assets/video/reel4-preview.mp4",
      video: "assets/video/reel4/master.m3u8",
      url: "https://www.facebook.com/reel/1245324753666981"
    },
    {
      title: "Heart Rate Zones",
      client: "Sajjad Hossain Snigdho",
      image: "assets/client/reel_1470923473890560.jpg",
      preview: "assets/video/reel5-preview.mp4",
      video: "assets/video/reel5/master.m3u8",
      url: "https://www.facebook.com/reel/1470923473890560"
    }
  ],

  explainers: [
    {
      title: "Why AI Needs a Harness",
      category: "AI",
      image: "assets/explainers/ex2.jpg",
      preview: "assets/video/ex2-preview.mp4",
      video: "assets/video/ex2/master.m3u8",
      url: "https://www.facebook.com/reel/938533692248689"
    },
    {
      title: "How Google Maps Sees Traffic",
      category: "Tech",
      image: "assets/explainers/ex1.jpg",
      preview: "assets/video/ex1-preview.mp4",
      video: "assets/video/ex1/master.m3u8",
      url: "https://www.facebook.com/reel/1796560441669716"
    },
    {
      title: "How a Falcon 9 Lands Itself",
      category: "Space",
      image: "assets/explainers/ex3.jpg",
      preview: "assets/video/ex3-preview.mp4",
      video: "assets/video/ex3/master.m3u8",
      url: "https://www.facebook.com/reel/1784108505961817"
    },
    {
      title: "Why Face ID Works in the Dark",
      category: "Tech",
      image: "assets/explainers/ex5.jpg",
      preview: "assets/video/ex5-preview.mp4",
      video: "assets/video/ex5/master.m3u8",
      url: "https://www.facebook.com/reel/1689319389434635"
    },
    {
      title: "How Neural Networks Learn",
      description: "How a machine learns to think, from Face ID to ChatGPT.",
      category: "AI",
      wide: true,
      image: "assets/explainers/ex4.jpg",
      preview: "assets/video/ex4-preview.mp4",
      video: "assets/video/ex4/master.m3u8",
      url: "https://www.facebook.com/reel/1644402523879378"
    }
  ],

  /* Photography: each has -800.webp and -1600.webp */
  photos: [
    { src: "assets/photos/p01", w: 1200, h: 1600, alt: "Sailboat drifting through morning mist" },
    { src: "assets/photos/p02", w: 1600, h: 1200, alt: "Palm trees mirrored in still water, black and white" },
    { src: "assets/photos/p03", w: 1279, h: 1600, alt: "Close portrait of a young boy" },
    { src: "assets/photos/p04", w: 1200, h: 1600, alt: "Black-and-white cat with a moustache mark" },
    { src: "assets/photos/p05", w: 1200, h: 1600, alt: "Couple walking into a sunset-lit avenue" },
    { src: "assets/photos/p06", w: 1600, h: 1200, alt: "Long bridge vanishing into haze" },
    { src: "assets/photos/p07", w: 1200, h: 1600, alt: "Boat of villagers crossing a fog-white river" },
    { src: "assets/photos/p08", w: 1200, h: 1600, alt: "Old man in a red gamcha resting by the river" },
    { src: "assets/photos/p09", w: 1600, h: 1200, alt: "Long covered walkway in perfect perspective" },
    { src: "assets/photos/p10", w: 1245, h: 1600, alt: "Ring of palm crowns against a white sky" },
    { src: "assets/photos/p11", w: 1280, h: 1600, alt: "Peacock feather against a pale sky" },
    { src: "assets/photos/p12", w: 1200, h: 1600, alt: "Pink water lily held up against the sky" },
    { src: "assets/photos/p13", w: 1200, h: 1600, alt: "Cyclist under streetlights in dense fog" },
    { src: "assets/photos/p14", w: 1600, h: 1200, alt: "Rows of palms over misty paddy fields" },
    { src: "assets/photos/p15", w: 1200, h: 1600, alt: "Street dog sitting tall on a concrete ledge" },
    { src: "assets/photos/p16", w: 1280, h: 1600, alt: "Railway bridge fading into fog" },
    { src: "assets/photos/p17", w: 1080, h: 1439, alt: "Boy on the beach holding a net of coconuts" },
    { src: "assets/photos/p18", w: 1200, h: 1600, alt: "Lone palm tree in fog" },
    { src: "assets/photos/p19", w: 1456, h: 919, alt: "Lone shed in a fog-covered field" },
    { src: "assets/photos/p20", w: 1200, h: 1600, alt: "Lone tree in a green field under storm light" },
    { src: "assets/photos/p21", w: 1200, h: 1600, alt: "Tree tunnel road disappearing into mist" },
    { src: "assets/photos/p22", w: 1200, h: 1600, alt: "Kite perched alone on a branch" },
    { src: "assets/photos/p23", w: 1200, h: 1600, alt: "Small boat on a misty river" }
  ]
};
