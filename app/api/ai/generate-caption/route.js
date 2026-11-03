import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { destination = 'Dubai' } = await request.json();

    const captionTemplates = {
      'Dubai': [
        `✈️ Discover the magic of DUBAI with Naria Holidays! 🌆✨\nExperience Burj Khalifa sky views, thrilling Desert Safaris with BBQ dinner, and luxury shopping extravaganza!\n\n🌟 5 Days / 4 Nights Exclusive Package Includes:\n✔️ Return Air Tickets\n✔️ 4-Star Hotel Stay with Breakfast\n✔️ Dubai Marina Dhow Cruise\n✔️ Desert Safari with Quad Biking\n✔️ All Airport Transfers & Visa Assistance\n\n🔥 Limited seats! Book today for special discount.\n📞 Hotline/WhatsApp: +880 1711-000000\n📍 Naria Holidays, Dhaka\n#NariaHolidays #DubaiTour #DubaiHoliday #TravelGoals #LuxuryTravel #BurjKhalifa #Wanderlust`,
        `✨ Dubai Calling! 🇦🇪 Spend unforgettable moments in the city of wonders with our signature tour package.\n\nFrom futuristic skyline views to golden desert dunes, Naria Holidays handles everything so you can just enjoy.\n\n📩 Send us a direct message for package pricing and customized itineraries!\n#DubaiTrip #NariaHolidays #HolidaySeason #TourPackage #DesertSafari`
      ],
      'Maldives': [
        `🌊 Escape to Paradise! Maldives Overwater Villa Special by Naria Holidays 🏝️💙\n\nWaking up to crystal-clear turquoise waters and endless marine life! 🌅\n\n✨ Package Highlights:\n✔️ Luxury Overwater Pool Villa\n✔️ Speedboat / Seaplane transfers\n✔️ Full-board gourmet meals\n✔️ Complimentary snorkeling & water sports\n\nTag your travel partner! 👇 Let's turn your dream vacation into reality.\n📲 DM or Call: +880 1711-000000\n#MaldivesVibes #NariaHolidays #TropicalEscape #HoneymoonPackage #TravelAddict #OverwaterVilla`,
        `💙 Turquoise waters, sandy white beaches, and the peace you deserve. Maldives 4N/5D all-inclusive package booking is now open!\n\nContact Naria Holidays today for early-bird flight & resort deals.\n#MaldivesTour #NariaHolidays #BeachHoliday #LuxuryVacation`
      ],
      'Umrah': [
        `🕋 পবিত্র ওমরাহ হজ্ব প্যাকেজ ২০২৬ - Naria Holidays এর সাথে নির্বিঘ্ন ইবাদতের অনন্য সুযোগ।\n\nআমাদের বিশেষ সেবা সমূহ:\n✔️ হারামাইন শরীফের খুব কাছে প্রিমিয়াম হোটেল\n✔️ সরাসরি ফ্লাইট ও ভিসা প্রসেসিং\n✔️ অভিজ্ঞ মুয়াল্লিম দ্বারা প্রতিটি ঐতিহাসিক স্থান জিয়ারাহ\n✔️ সার্বক্ষণিক গাইডেন্স ও এয়ারপোর্ট সহায়তা\n\nআল্লাহ তায়ালা আমাদের সবার হজ্ব ও ওমরাহ কবুল করুন।\nবিস্তারিত জানতে এখনই কল করুন: +880 1711-000000\n#Umrah2026 #NariaHolidays #UmrahPackage #Makkah #Madinah #BlessedJourney`,
        `🕋 ওমরাহ পালন করুন স্বস্তি ও আস্থার সাথে। Naria Holidays দিচ্ছে স্বল্প খরচে প্রিমিয়াম ওমরাহ প্যাকেজ।\nপরিবার সহ বুকিংয়ের জন্য যোগাযোগ করুন আমাদের ঢাকা অফিসে।\n#UmrahHajj #NariaHolidays #IslamicTours #MakkahMadinah`
      ],
      'Sajek': [
        `☁️ মেঘের দেশে সাজেক ভ্যালি! 🏔️ পাহাড়ি কুয়াশা আর সবুজ পাহাড়ের মায়ায় হারিয়ে যান Naria Holidays এর সাথে।\n\n🎒 ৩ দিন ২ রাতের আকর্ষণীয় প্যাকেজ:\n✔️ ঢাকা-খাগড়াছড়ি-ঢাকা আরামদায়ক বাস সার্ভিস\n✔️ সাজেকের সেরা ভিউ রিসোর্টে থাকা\n✔️ চাঁদের গাড়ি ও সকল সাইটসিয়িং\n✔️ স্থানীয় আদিবাসী খাবার ও বারবিকিউ নাইট\n\nপ্রতিটি মুহূর্তকে স্মৃতিময় করতে আসন নিশ্চিত করুন আজই!\n#SajekValley #NariaHolidays #ExploreBangladesh #CloudParadise #WeekendTour`,
        `🏔️ মেঘের রাজ্য সাজেক ভ্যালির শীতল হাওয়া আর রোমাঞ্চকর পাহাড়ি যাত্রা! উইকএন্ডে ঘুরে আসুন প্রিয়জন নিয়ে।\nবুকিংয়ের জন্য ইনবক্স করুন।\n#SajekTour #NariaHolidays #TravelBangladesh`
      ],
      'Coxsbazar': [
        `🌊 বিশ্বের দীর্ঘতম সমুদ্র সৈকত কক্সবাজার ভ্রমণ হোক বিলাসবহুল ও আনন্দময়! 🏖️\n\nNaria Holidays প্রিমিয়াম কক্সবাজার প্যাকেজে পাচ্ছেন:\n✔️ ৫ তারকা ও প্রিমিয়াম বিচ রিসোর্ট স্টে\n✔️ কমপ্লিমেন্টারি ব্রেকফাস্ট ও সুইমিং পুল সুবিধা\n✔️ ইনানী ও মেরিন ড্রাইভ স্পেশাল ট্যুর\n\nপরিবার ও বন্ধুদের সাথে আনন্দের মুহূর্ত কাটাতে এখনই কল করুন: +880 1711-000000\n#CoxsBazar #NariaHolidays #BeachLife #TravelBangladesh #SeaView`,
        `🌅 সূর্যাস্তের মনোরম দৃশ্য আর সমুদ্রের গর্জন। কক্সবাজার বিচ প্যাকেজে বিশেষ ছাড়! যোগাযোগ করুন Naria Holidays.\n#CoxsBazarTour #NariaHolidays #OceanVibes`
      ]
    };

    const pool = captionTemplates[destination] || captionTemplates['Dubai'];
    const caption = pool[Math.floor(Math.random() * pool.length)];

    return NextResponse.json({
      success: true,
      caption,
      destination
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to generate caption' }, { status: 500 });
  }
}

