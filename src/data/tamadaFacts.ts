export interface TamadaFact {
  ka: string;
  en: string;
  category: "history" | "tamada" | "wine" | "qvevri" | "proverb" | "region" | "culture" | "food";
}

export const tamadaFacts: TamadaFact[] = [
  // History
  { ka: "სუფრის ტრადიცია 3000 წელზე მეტს ითვლის — ძველი კოლხეთის დროიდან", en: "The tradition of supra dates back over 3,000 years to ancient Colchis.", category: "history" },
  { ka: "საქართველო ღვინის სამშობლოა — 8000 წლიანი მეღვინეობის ისტორიით", en: "Georgia is the birthplace of wine, with 8,000 years of winemaking history.", category: "history" },
  { ka: "უძველესი ღვინის ნაშთები აღმოჩენილია საქართველოში, ძვ.წ. 6000 წელს", en: "The oldest wine residue ever found was discovered in Georgia, dating to 6000 BC.", category: "history" },
  { ka: "ქართული ანბანი მსოფლიოს 14 უნიკალურ ანბანს შორისაა", en: "The Georgian alphabet is among only 14 unique writing systems in the world.", category: "history" },
  { ka: "თბილისი 1500 წელზე მეტია საქართველოს დედაქალაქი", en: "Tbilisi has been Georgia's capital for over 1,500 years.", category: "history" },

  // Tamada role
  { ka: "თამადას არ ირჩევენ — მას სუფრა თავად აღიარებს", en: "A tamada is never elected — they are recognized by the table.", category: "tamada" },
  { ka: "თამადა უნდა იყოს მჭერმეტყველი, თავმდაბალი და გულუხვი", en: "A tamada must be eloquent, humble, and generous of spirit.", category: "tamada" },
  { ka: "თამადა სუფრის სულია — ის განსაზღვრავს საღამოს რიტმს და განწყობას", en: "The tamada is the soul of the supra — they set the rhythm and mood of the evening.", category: "tamada" },
  { ka: "კარგი თამადა ყოველთვის იცის, როდის უნდა იყოს სერიოზული და როდის — მხიარული", en: "A great tamada always knows when to be serious and when to be joyful.", category: "tamada" },
  { ka: "თამადობა მამაკაცის საქმედ ითვლებოდა, თუმცა დღეს ქალებიც ბრწყინვალედ ასრულებენ", en: "Tamada was traditionally a man's role, but today women excel at it too.", category: "tamada" },
  { ka: "თამადას არ აქვს უფლება, სადღეგრძელო გამოტოვოს — ეს უპატივცემულობაა", en: "A tamada must never skip a toast — it would be considered disrespectful.", category: "tamada" },

  // Wine
  { ka: "საქართველოში 500-ზე მეტი ადგილობრივი ვაზის ჯიშია", en: "Georgia has over 500 indigenous grape varieties.", category: "wine" },
  { ka: "საფერავი საქართველოს ყველაზე ცნობილი წითელი ვაზის ჯიშია", en: "Saperavi is Georgia's most famous red grape variety.", category: "wine" },
  { ka: "რქაწითელი მსოფლიოს ერთ-ერთი უძველესი თეთრი ვაზის ჯიშია", en: "Rkatsiteli is one of the world's oldest white grape varieties.", category: "wine" },
  { ka: "ქართული ღვინო ტრადიციულად ქვევრში მზადდება, მიწაში ჩაფლულ თიხის ჭურჭელში", en: "Georgian wine is traditionally made in qvevri — clay vessels buried in the ground.", category: "wine" },
  { ka: "ქართული სუფრა ღვინის გარეშე წარმოუდგენელია — ღვინო სტუმართმოყვარეობის სიმბოლოა", en: "A Georgian supra without wine is unthinkable — wine symbolizes hospitality.", category: "wine" },

  // Qvevri
  { ka: "ქვევრში ღვინის დაყენება 2013 წლიდან UNESCO-ს არამატერიალური მემკვიდრეობის ძეგლია", en: "Qvevri winemaking has been UNESCO Intangible Cultural Heritage since 2013.", category: "qvevri" },
  { ka: "ქვევრი შეიძლება 800 წელზე მეტ ხანს გამოიყენებოდეს", en: "A qvevri can be used for over 800 years.", category: "qvevri" },
  { ka: "ქვევრის მოცულობა 10-დან 10,000 ლიტრამდე მერყეობს", en: "Qvevri range in size from 10 to 10,000 liters.", category: "qvevri" },

  // Proverbs
  { ka: "ქართული ანდაზა: „სტუმარი ღვთის მოვლინებაა"", en: "Georgian proverb: 'A guest is a gift from God.'", category: "proverb" },
  { ka: "ქართული ანდაზა: „კარგი სიტყვა კარს გააღებს"", en: "Georgian proverb: 'A kind word opens any door.'", category: "proverb" },
  { ka: "ქართული ანდაზა: „მეგობარი გაჭირვებაში გამოიცნობა"", en: "Georgian proverb: 'A friend is known in times of hardship.'", category: "proverb" },
  { ka: "ქართული ანდაზა: „ერთი ფუტკარი ბევრ თაფლს არ მოიტანს"", en: "Georgian proverb: 'One bee doesn't bring much honey.'", category: "proverb" },
  { ka: "ქართული ანდაზა: „ვინც არ მუშაობს, არ ჭამს"", en: "Georgian proverb: 'He who doesn't work, doesn't eat.'", category: "proverb" },

  // Regions
  { ka: "კახეთში სადღეგრძელოები ვრცელი და პოეტურია — რეგიონის ღრმა ღვინის კულტურის ასახვა", en: "In Kakheti, toasts are elaborate and poetic, reflecting the region's deep wine culture.", category: "region" },
  { ka: "იმერეთის სუფრა გამოირჩევა მსუბუქი, ხალისიანი ატმოსფეროთი", en: "Imeretian supras are known for their lighter, more playful atmosphere.", category: "region" },
  { ka: "სვანეთში სუფრა ხშირად რელიგიურ რიტუალებთან არის დაკავშირებული", en: "In Svaneti, supras are often tied to religious rituals and ceremonies.", category: "region" },

  // Culture
  { ka: "შოთა რუსთაველის „ვეფხისტყაოსანი" თითქმის ყველა ფორმალურ სუფრაზე ციტირდება", en: "Shota Rustaveli's 'The Knight in the Panther's Skin' is quoted at nearly every formal supra.", category: "culture" },
  { ka: "ქართული პოლიფონიური სიმღერა UNESCO-ს მემკვიდრეობის ძეგლია", en: "Georgian polyphonic singing is a UNESCO Intangible Cultural Heritage.", category: "culture" },
  { ka: "სადღეგრძელო „ალავერდი" ნიშნავს, რომ სუფრის წევრს შეუძლია გააგრძელოს თამადას სიტყვა", en: "An 'alaverdi' toast means a guest may continue the tamada's theme in their own words.", category: "culture" },
  { ka: "პირველი სადღეგრძელო ყოველთვის ღვთის ან უფლის სადიდებლად ითქმის", en: "The first toast is always raised to God or the Creator.", category: "culture" },
  { ka: "ქართულ სუფრაზე არავინ სვამს სადღეგრძელოს გარეშე — ეს უხეშობად ითვლება", en: "At a Georgian supra, no one drinks without a toast — it's considered rude.", category: "culture" },

  // Food
  { ka: "ხინკალი — ქართული სუფრის ერთ-ერთი ყველაზე საყვარელი კერძია", en: "Khinkali — Georgian dumplings — are one of the most beloved supra dishes.", category: "food" },
  { ka: "ჩურჩხელას „ქართულ სნიკერსს" ეძახიან — ეს ძველი ქართული ტკბილეულია", en: "Churchkhela is called 'Georgian Snickers' — it's an ancient Georgian candy.", category: "food" },
  { ka: "საქართველოში პურის გამოცხობა საკრალური პროცესია — შოთი ტრადიციული თონის პურია", en: "Bread-baking is sacred in Georgia — shotis puri is the traditional tandoor bread.", category: "food" },
];

export const CATEGORY_ICONS: Record<TamadaFact["category"], string> = {
  history: "📜",
  tamada: "🎩",
  wine: "🍷",
  qvevri: "🏺",
  proverb: "💬",
  region: "🗺️",
  culture: "🎶",
  food: "🍽️",
};
