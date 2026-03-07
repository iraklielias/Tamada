export interface TamadaFact {
  ka: string;
  en: string;
  category: "history" | "tamada" | "wine" | "qvevri" | "proverb" | "region" | "culture" | "food" | "dance" | "architecture" | "cuisine";
}

export const tamadaFacts: TamadaFact[] = [
  // History
  {
    ka: "სუფრის ტრადიცია 3000 წელზე მეტს ითვლის — ძველი კოლხეთის დროიდან",
    en: "The tradition of supra dates back over 3,000 years to ancient Colchis.",
    category: "history",
  },
  {
    ka: "საქართველო ღვინის სამშობლოა — 8000 წლიანი მეღვინეობის ისტორიით",
    en: "Georgia is the birthplace of wine, with 8,000 years of winemaking history.",
    category: "history",
  },
  {
    ka: "უძველესი ღვინის ნაშთები აღმოჩენილია საქართველოში, ძვ.წ. 6000 წელს",
    en: "The oldest wine residue ever found was discovered in Georgia, dating to 6000 BC.",
    category: "history",
  },
  {
    ka: "ქართული ანბანი მსოფლიოს 14 უნიკალურ ანბანს შორისაა",
    en: "The Georgian alphabet is among only 14 unique writing systems in the world.",
    category: "history",
  },
  {
    ka: "თბილისი 1500 წელზე მეტია საქართველოს დედაქალაქი",
    en: "Tbilisi has been Georgia's capital for over 1,500 years.",
    category: "history",
  },
  // Tamada role
  {
    ka: "თამადას არ ირჩევენ — მას სუფრა თავად აღიარებს",
    en: "A tamada is never elected \u2014 they are recognized by the table.",
    category: "tamada",
  },
  {
    ka: "თამადა უნდა იყოს მჭერმეტყველი, თავმდაბალი და გულუხვი",
    en: "A tamada must be eloquent, humble, and generous of spirit.",
    category: "tamada",
  },
  {
    ka: "თამადა სუფრის სულია — ის განსაზღვრავს საღამოს რითმს და განწყობას",
    en: "The tamada is the soul of the supra \u2014 they set the rhythm and mood of the evening.",
    category: "tamada",
  },
  {
    ka: "კარგი თამადა ყოველთვის იცის, როდის უნდა იყოს სერიოზული და როდის — მხიარული",
    en: "A great tamada always knows when to be serious and when to be joyful.",
    category: "tamada",
  },
  {
    ka: "თამადობა მამაკაცის საქმედ ითვლებოდა, თუმცა დღეს ქალებიც ბრწყინვალედ ასრულებენ",
    en: "Tamada was traditionally a man's role, but today women excel at it too.",
    category: "tamada",
  },
  {
    ka: "თამადას არ აქვს უფლება, სადღეგრძელო გამოტოვოს — ეს უპატივცემულობაა",
    en: "A tamada must never skip a toast \u2014 it would be considered disrespectful.",
    category: "tamada",
  },
  // Wine
  {
    ka: "საქართველოში 500-ზე მეტი ადგილობრივი ვაზის ჯიშია",
    en: "Georgia has over 500 indigenous grape varieties.",
    category: "wine",
  },
  {
    ka: "საფერავი საქართველოს ყველაზე ცნობილი წითელი ვაზის ჯიშია",
    en: "Saperavi is Georgia's most famous red grape variety.",
    category: "wine",
  },
  {
    ka: "რქაწითელი მსოფლიოს ერთ-ერთი უძველესი თეთრი ვაზის ჯიშია",
    en: "Rkatsiteli is one of the world's oldest white grape varieties.",
    category: "wine",
  },
  {
    ka: "ქართული ღვინო ტრადიციულად ქვევრში მზადდება, მიწაში ჩაფლულ თიხის ჭურჭელში",
    en: "Georgian wine is traditionally made in qvevri \u2014 clay vessels buried in the ground.",
    category: "wine",
  },
  {
    ka: "ქართული სუფრა ღვინის გარეშე წარმოუდგენელია — ღვინო სტუმართმოყვარეობის სიმბოლოა",
    en: "A Georgian supra without wine is unthinkable \u2014 wine symbolizes hospitality.",
    category: "wine",
  },
  // Qvevri
  {
    ka: "ქვევრში ღვინის დაყენება 2013 წლიდან UNESCO-ს არამატერიალური მემკვიდრეობის ძეგლია",
    en: "Qvevri winemaking has been UNESCO Intangible Cultural Heritage since 2013.",
    category: "qvevri",
  },
  {
    ka: "ქვევრი შეიძლება 800 წელზე მეტ ხანს გამოიყენებოდეს",
    en: "A qvevri can be used for over 800 years.",
    category: "qvevri",
  },
  {
    ka: "ქვევრის მოცულობა 10-დან 10,000 ლიტრამდე მერყეობს",
    en: "Qvevri range in size from 10 to 10,000 liters.",
    category: "qvevri",
  },
  // Proverbs
  {
    ka: "ქართული ანდაზა: სტუმარი ღვთის მოვლინებაა",
    en: "Georgian proverb: 'A guest is a gift from God.'",
    category: "proverb",
  },
  {
    ka: "ქართული ანდაზა: კარგი სიტყვა კარს გააღებს",
    en: "Georgian proverb: 'A kind word opens any door.'",
    category: "proverb",
  },
  {
    ka: "ქართული ანდაზა: მეგობარი გაჭირვებაში გამოიცნობა",
    en: "Georgian proverb: 'A friend is known in times of hardship.'",
    category: "proverb",
  },
  {
    ka: "ქართული ანდაზა: ერთი ფუტკარი ბევრ თაფლს არ მოიტანს",
    en: "Georgian proverb: 'One bee doesn't bring much honey.'",
    category: "proverb",
  },
  {
    ka: "ქართული ანდაზა: ვინც არ მუშაობს, არ ჭამს",
    en: "Georgian proverb: 'He who doesn't work, doesn't eat.'",
    category: "proverb",
  },
  // Regions
  {
    ka: "კახეთში სადღეგრძელოები ვრცელი და პოეტურია",
    en: "In Kakheti, toasts are elaborate and poetic, reflecting the region's deep wine culture.",
    category: "region",
  },
  {
    ka: "იმერეთის სუფრა გამოირჩევა მსუბუქი, ხალისიანი ატმოსფეროთი",
    en: "Imeretian supras are known for their lighter, more playful atmosphere.",
    category: "region",
  },
  {
    ka: "სვანეთში სუფრა ხშირად რელიგიურ რიტუალებთან არის დაკავშირებული",
    en: "In Svaneti, supras are often tied to religious rituals and ceremonies.",
    category: "region",
  },
  // Culture
  {
    ka: "შოთა რუსთაველის ვეფხისტყაოსანი თითქმის ყველა ფორმალურ სუფრაზე ციტირდება",
    en: "Shota Rustaveli's 'The Knight in the Panther's Skin' is quoted at nearly every formal supra.",
    category: "culture",
  },
  {
    ka: "ქართული პოლიფონიური სიმღერა UNESCO-ს მემკვიდრეობის ძეგლია",
    en: "Georgian polyphonic singing is a UNESCO Intangible Cultural Heritage.",
    category: "culture",
  },
  {
    ka: "სადღეგრძელო ალავერდი ნიშნავს, რომ სტუმარმა შეუძლია გააგრძელოს თამადას თემა",
    en: "An 'alaverdi' toast means a guest may continue the tamada's theme in their own words.",
    category: "culture",
  },
  {
    ka: "პირველი სადღეგრძელო ყოველთვის ღვთის ან უფლის სადიდებლად ითქმის",
    en: "The first toast is always raised to God or the Creator.",
    category: "culture",
  },
  {
    ka: "ქართულ სუფრაზე არავინ სვამს სადღეგრძელოს გარეშე — ეს უხეშობად ითვლება",
    en: "At a Georgian supra, no one drinks without a toast \u2014 it's considered rude.",
    category: "culture",
  },
  // Food
  {
    ka: "ხინკალი — ქართული სუფრის ერთ-ერთი ყველაზე საყვარელი კერძია",
    en: "Khinkali \u2014 Georgian dumplings \u2014 are one of the most beloved supra dishes.",
    category: "food",
  },
  {
    ka: "ჩურჩხელას ქართულ სნიკერსს ეძახიან — ეს ძველი ქართული ტკბილეულია",
    en: "Churchkhela is called 'Georgian Snickers' \u2014 it's an ancient Georgian candy.",
    category: "food",
  },
  {
    ka: "საქართველოში პურის გამოცხობა საკრალური პროცესია — შოთი ტრადიციული თონის პურია",
    en: "Bread-baking is sacred in Georgia \u2014 shotis puri is the traditional tandoor bread.",
    category: "food",
  },
  // Dance traditions
  {
    ka: "ქართული ცეკვა კართული სიყვარულის ამბავს მოგვითხრობს — მამაკაცი ქალს მოწიწებით უვლის",
    en: "The 'Kartuli' dance tells a love story \u2014 the man courts the woman with grace and reverence.",
    category: "dance",
  },
  {
    ka: "ცეკვა ხორუმი ომის ცეკვაა — 40-მდე მეომარი სინქრონულად მოძრაობს",
    en: "The 'Khorumi' is a war dance performed by up to 40 warriors moving in perfect sync.",
    category: "dance",
  },
  {
    ka: "აჭარული ცეკვა ცნობილია თავისი სიმხიარულითა და ფეხის თითებზე ცეკვით",
    en: "The 'Acharuli' dance is famous for its joyful energy and men dancing on their toes.",
    category: "dance",
  },
  {
    ka: "ქართველი მამაკაცები ფეხის თითებზე ცეკვავენ პუანტების გარეშე — მხოლოდ ფეხსამოსით",
    en: "Georgian men dance on their toes without pointe shoes \u2014 only in soft leather boots.",
    category: "dance",
  },
  {
    ka: "მთიულური ცეკვა მთიელთა ძალასა და სიმამაცეს ასახავს",
    en: "The 'Mtiuluri' dance captures the strength and bravery of Georgian mountain people.",
    category: "dance",
  },
  // Famous historical figures
  {
    ka: "დავით აღმაშენებელმა საქართველო ძლიერ სამეფოდ აქცია XII საუკუნეში",
    en: "King David the Builder transformed Georgia into a powerful kingdom in the 12th century.",
    category: "history",
  },
  {
    ka: "თამარ მეფე საქართველოს ოქროს ხანის მმართველი იყო — პირველი ქალი მეფე კავკასიაში",
    en: "Queen Tamar ruled Georgia's Golden Age \u2014 the first woman monarch in the Caucasus.",
    category: "history",
  },
  {
    ka: "შოთა რუსთაველი XII საუკუნის პოეტია — ვეფხისტყაოსანი მსოფლიო ლიტერატურის შედევრია",
    en: "Shota Rustaveli, the 12th-century poet, wrote 'The Knight in the Panther's Skin' \u2014 a world literary masterpiece.",
    category: "history",
  },
  {
    ka: "ნიკო ფიროსმანი — თვითნასწავლი მხატვარი, რომლის ნამუშევრები მსოფლიო მუზეუმებშია",
    en: "Niko Pirosmani was a self-taught painter whose works hang in museums worldwide.",
    category: "culture",
  },
  {
    ka: "ილია ჭავჭავაძე ერის მამას უწოდებენ — თანამედროვე ქართული ერის ფუძემდებელი",
    en: "Ilia Chavchavadze is called the 'Father of the Nation' \u2014 founder of modern Georgian identity.",
    category: "history",
  },
  // Architecture
  {
    ka: "ჯვარის მონასტერი (VI ს.) UNESCO-ს მსოფლიო მემკვიდრეობის ძეგლია",
    en: "Jvari Monastery (6th century) is a UNESCO World Heritage Site overlooking Mtskheta.",
    category: "architecture",
  },
  {
    ka: "სვანური კოშკები თავდაცვის მიზნით აშენდა — ზოგიერთი 1000 წელზე მეტისაა",
    en: "Svan towers were built for defense \u2014 some are over 1,000 years old and still standing.",
    category: "architecture",
  },
  {
    ka: "გელათის მონასტერი XII საუკუნეშია აშენებული და ქართული კულტურის სიმბოლოა",
    en: "Gelati Monastery, built in the 12th century, is a symbol of Georgian cultural achievement.",
    category: "architecture",
  },
  {
    ka: "ვარძია — კლდეში ნაკვეთი ქალაქი 6000 ოთახით, XII საუკუნეში აშენებული",
    en: "Vardzia is a cave city carved into a cliff with 6,000 rooms, built in the 12th century.",
    category: "architecture",
  },
  {
    ka: "თბილისის აბანოთუბანი ცნობილია გოგირდის აბანოებით — ქალაქის სახელიც თბილ წყალს ნიშნავს",
    en: "Tbilisi's Abanotubani is famous for its sulfur baths \u2014 the city's name means 'warm waters.'",
    category: "architecture",
  },
  // Regional cuisine differences
  {
    ka: "კახეთში მწვადი და ბადრიჯნის როლი ძირითადია — მუქი ღვინო სამზარეულოში ყველგანაა",
    en: "In Kakheti, grilled meats and eggplant rolls dominate \u2014 rich red wine is in every dish.",
    category: "cuisine",
  },
  {
    ka: "იმერეთში ხაჭაპური თხელია და ნაკლები ყველით — იმერული ხაჭაპური ყველაზე პოპულარულია",
    en: "In Imereti, khachapuri is thin with less cheese \u2014 Imeruli khachapuri is the most popular nationwide.",
    category: "cuisine",
  },
  {
    ka: "აჭარაში ხაჭაპური ნავის ფორმისაა, კვერცხითა და კარაქით — ცნობილი აჭარული",
    en: "In Adjara, khachapuri is boat-shaped with egg and butter \u2014 the famous 'Adjaruli.'",
    category: "cuisine",
  },
  {
    ka: "მეგრეული სამზარეულო საქართველოში ყველაზე ცხარეა — აჯიკა და გებჟალია სტაფილოა",
    en: "Megrelian cuisine is the spiciest in Georgia \u2014 ajika sauce and gebzhalia cheese are fiery staples.",
    category: "cuisine",
  },
  {
    ka: "ფხალი — სხვადასხვა ბოსტნეულისგან მომზადებული ნიგვზიანი პასტა, ყველა რეგიონს თავისი აქვს",
    en: "Pkhali is a walnut-herb paste made from different greens \u2014 every region has its own version.",
    category: "cuisine",
  },
];

export const CATEGORY_ICONS: Record<TamadaFact["category"], string> = {
  history: "\uD83D\uDCDC",
  tamada: "\uD83C\uDFA9",
  wine: "\uD83C\uDF77",
  qvevri: "\uD83C\uDFFA",
  proverb: "\uD83D\uDCAC",
  region: "\uD83D\uDDFA\uFE0F",
  culture: "\uD83C\uDFB6",
  food: "\uD83C\uDF7D\uFE0F",
  dance: "\uD83D\uDC83",
  architecture: "\uD83C\uDFDB\uFE0F",
  cuisine: "\uD83E\uDDD1\u200D\uD83C\uDF73",
};
