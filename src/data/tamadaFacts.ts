export interface TamadaFact {
  ka: string;
  en: string;
  category: "history" | "tamada" | "wine" | "qvevri" | "proverb" | "region" | "culture" | "food" | "dance" | "architecture" | "cuisine";
}

export const tamadaFacts: TamadaFact[] = [
  // History
  {
    ka: "\u10E1\u10E3\u10E4\u10E0\u10D8\u10E1 \u10E2\u10E0\u10D0\u10D3\u10D8\u10EA\u10D8\u10D0 3000 \u10EC\u10D4\u10DA\u10D6\u10D4 \u10DB\u10D4\u10E2\u10E1 \u10D8\u10D7\u10D5\u10DA\u10D8\u10E1 \u2014 \u10EB\u10D5\u10D4\u10DA\u10D8 \u10D9\u10DD\u10DA\u10EE\u10D4\u10D7\u10D8\u10E1 \u10D3\u10E0\u10DD\u10D8\u10D3\u10D0\u10DC",
    en: "The tradition of supra dates back over 3,000 years to ancient Colchis.",
    category: "history",
  },
  {
    ka: "\u10E1\u10D0\u10E5\u10D0\u10E0\u10D7\u10D5\u10D4\u10DA\u10DD \u10E6\u10D5\u10D8\u10DC\u10D8\u10E1 \u10E1\u10D0\u10DB\u10E8\u10DD\u10D1\u10DA\u10DD\u10D0 \u2014 8000 \u10EC\u10DA\u10D8\u10D0\u10DC\u10D8 \u10DB\u10D4\u10E6\u10D5\u10D8\u10DC\u10D4\u10DD\u10D1\u10D8\u10E1 \u10D8\u10E1\u10E2\u10DD\u10E0\u10D8\u10D8\u10D7",
    en: "Georgia is the birthplace of wine, with 8,000 years of winemaking history.",
    category: "history",
  },
  {
    ka: "\u10E3\u10EB\u10D5\u10D4\u10DA\u10D4\u10E1\u10D8 \u10E6\u10D5\u10D8\u10DC\u10D8\u10E1 \u10DC\u10D0\u10E8\u10D7\u10D4\u10D1\u10D8 \u10D0\u10E6\u10DB\u10DD\u10E9\u10D4\u10DC\u10D8\u10DA\u10D8\u10D0 \u10E1\u10D0\u10E5\u10D0\u10E0\u10D7\u10D5\u10D4\u10DA\u10DD\u10E8\u10D8, \u10EB\u10D5.\u10EC. 6000 \u10EC\u10D4\u10DA\u10E1",
    en: "The oldest wine residue ever found was discovered in Georgia, dating to 6000 BC.",
    category: "history",
  },
  {
    ka: "\u10E5\u10D0\u10E0\u10D7\u10E3\u10DA\u10D8 \u10D0\u10DC\u10D1\u10D0\u10DC\u10D8 \u10DB\u10E1\u10DD\u10E4\u10DA\u10D8\u10DD\u10E1 14 \u10E3\u10DC\u10D8\u10D9\u10D0\u10DA\u10E3\u10E0 \u10D0\u10DC\u10D1\u10D0\u10DC\u10E1 \u10E8\u10DD\u10E0\u10D8\u10E1\u10D0\u10D0",
    en: "The Georgian alphabet is among only 14 unique writing systems in the world.",
    category: "history",
  },
  {
    ka: "\u10D7\u10D1\u10D8\u10DA\u10D8\u10E1\u10D8 1500 \u10EC\u10D4\u10DA\u10D6\u10D4 \u10DB\u10D4\u10E2\u10D8\u10D0 \u10E1\u10D0\u10E5\u10D0\u10E0\u10D7\u10D5\u10D4\u10DA\u10DD\u10E1 \u10D3\u10D4\u10D3\u10D0\u10E5\u10D0\u10DA\u10D0\u10E5\u10D8",
    en: "Tbilisi has been Georgia's capital for over 1,500 years.",
    category: "history",
  },
  // Tamada role
  {
    ka: "\u10D7\u10D0\u10DB\u10D0\u10D3\u10D0\u10E1 \u10D0\u10E0 \u10D8\u10E0\u10E9\u10D4\u10D5\u10D4\u10DC \u2014 \u10DB\u10D0\u10E1 \u10E1\u10E3\u10E4\u10E0\u10D0 \u10D7\u10D0\u10D5\u10D0\u10D3 \u10D0\u10E6\u10D8\u10D0\u10E0\u10D4\u10D1\u10E1",
    en: "A tamada is never elected \u2014 they are recognized by the table.",
    category: "tamada",
  },
  {
    ka: "\u10D7\u10D0\u10DB\u10D0\u10D3\u10D0 \u10E3\u10DC\u10D3\u10D0 \u10D8\u10E7\u10DD\u10E1 \u10DB\u10ED\u10D4\u10E0\u10DB\u10D4\u10E2\u10E7\u10D5\u10D4\u10DA\u10D8, \u10D7\u10D0\u10D5\u10DB\u10D3\u10D0\u10D1\u10D0\u10DA\u10D8 \u10D3\u10D0 \u10D2\u10E3\u10DA\u10E3\u10EE\u10D5\u10D8",
    en: "A tamada must be eloquent, humble, and generous of spirit.",
    category: "tamada",
  },
  {
    ka: "\u10D7\u10D0\u10DB\u10D0\u10D3\u10D0 \u10E1\u10E3\u10E4\u10E0\u10D8\u10E1 \u10E1\u10E3\u10DA\u10D8\u10D0 \u2014 \u10D8\u10E1 \u10D2\u10D0\u10DC\u10E1\u10D0\u10D6\u10E6\u10D5\u10E0\u10D0\u10D5\u10E1 \u10E1\u10D0\u10E6\u10D0\u10DB\u10DD\u10E1 \u10E0\u10D8\u10D7\u10DB\u10E1 \u10D3\u10D0 \u10D2\u10D0\u10DC\u10EC\u10E7\u10DD\u10D1\u10D0\u10E1",
    en: "The tamada is the soul of the supra \u2014 they set the rhythm and mood of the evening.",
    category: "tamada",
  },
  {
    ka: "\u10D9\u10D0\u10E0\u10D2\u10D8 \u10D7\u10D0\u10DB\u10D0\u10D3\u10D0 \u10E7\u10DD\u10D5\u10D4\u10DA\u10D7\u10D5\u10D8\u10E1 \u10D8\u10EA\u10D8\u10E1, \u10E0\u10DD\u10D3\u10D8\u10E1 \u10E3\u10DC\u10D3\u10D0 \u10D8\u10E7\u10DD\u10E1 \u10E1\u10D4\u10E0\u10D8\u10DD\u10D6\u10E3\u10DA\u10D8 \u10D3\u10D0 \u10E0\u10DD\u10D3\u10D8\u10E1 \u2014 \u10DB\u10EE\u10D8\u10D0\u10E0\u10E3\u10DA\u10D8",
    en: "A great tamada always knows when to be serious and when to be joyful.",
    category: "tamada",
  },
  {
    ka: "\u10D7\u10D0\u10DB\u10D0\u10D3\u10DD\u10D1\u10D0 \u10DB\u10D0\u10DB\u10D0\u10D9\u10D0\u10EA\u10D8\u10E1 \u10E1\u10D0\u10E5\u10DB\u10D4\u10D3 \u10D8\u10D7\u10D5\u10DA\u10D4\u10D1\u10DD\u10D3\u10D0, \u10D7\u10E3\u10DB\u10EA\u10D0 \u10D3\u10E6\u10D4\u10E1 \u10E5\u10D0\u10DA\u10D4\u10D1\u10D8\u10EA \u10D1\u10E0\u10EC\u10E7\u10D8\u10DC\u10D5\u10D0\u10DA\u10D4\u10D3 \u10D0\u10E1\u10E0\u10E3\u10DA\u10D4\u10D1\u10D4\u10DC",
    en: "Tamada was traditionally a man's role, but today women excel at it too.",
    category: "tamada",
  },
  {
    ka: "\u10D7\u10D0\u10DB\u10D0\u10D3\u10D0\u10E1 \u10D0\u10E0 \u10D0\u10E5\u10D5\u10E1 \u10E3\u10E4\u10DA\u10D4\u10D1\u10D0, \u10E1\u10D0\u10D3\u10E6\u10D4\u10D2\u10E0\u10EB\u10D4\u10DA\u10DD \u10D2\u10D0\u10DB\u10DD\u10E2\u10DD\u10D5\u10DD\u10E1 \u2014 \u10D4\u10E1 \u10E3\u10DE\u10D0\u10E2\u10D8\u10D5\u10EA\u10D4\u10DB\u10E3\u10DA\u10DD\u10D1\u10D0\u10D0",
    en: "A tamada must never skip a toast \u2014 it would be considered disrespectful.",
    category: "tamada",
  },
  // Wine
  {
    ka: "\u10E1\u10D0\u10E5\u10D0\u10E0\u10D7\u10D5\u10D4\u10DA\u10DD\u10E8\u10D8 500-\u10D6\u10D4 \u10DB\u10D4\u10E2\u10D8 \u10D0\u10D3\u10D2\u10D8\u10DA\u10DD\u10D1\u10E0\u10D8\u10D5\u10D8 \u10D5\u10D0\u10D6\u10D8\u10E1 \u10EF\u10D8\u10E8\u10D8\u10D0",
    en: "Georgia has over 500 indigenous grape varieties.",
    category: "wine",
  },
  {
    ka: "\u10E1\u10D0\u10E4\u10D4\u10E0\u10D0\u10D5\u10D8 \u10E1\u10D0\u10E5\u10D0\u10E0\u10D7\u10D5\u10D4\u10DA\u10DD\u10E1 \u10E7\u10D5\u10D4\u10DA\u10D0\u10D6\u10D4 \u10EA\u10DC\u10DD\u10D1\u10D8\u10DA\u10D8 \u10EC\u10D8\u10D7\u10D4\u10DA\u10D8 \u10D5\u10D0\u10D6\u10D8\u10E1 \u10EF\u10D8\u10E8\u10D8\u10D0",
    en: "Saperavi is Georgia's most famous red grape variety.",
    category: "wine",
  },
  {
    ka: "\u10E0\u10E5\u10D0\u10EC\u10D8\u10D7\u10D4\u10DA\u10D8 \u10DB\u10E1\u10DD\u10E4\u10DA\u10D8\u10DD\u10E1 \u10D4\u10E0\u10D7-\u10D4\u10E0\u10D7\u10D8 \u10E3\u10EB\u10D5\u10D4\u10DA\u10D4\u10E1\u10D8 \u10D7\u10D4\u10D7\u10E0\u10D8 \u10D5\u10D0\u10D6\u10D8\u10E1 \u10EF\u10D8\u10E8\u10D8\u10D0",
    en: "Rkatsiteli is one of the world's oldest white grape varieties.",
    category: "wine",
  },
  {
    ka: "\u10E5\u10D0\u10E0\u10D7\u10E3\u10DA\u10D8 \u10E6\u10D5\u10D8\u10DC\u10DD \u10E2\u10E0\u10D0\u10D3\u10D8\u10EA\u10D8\u10E3\u10DA\u10D0\u10D3 \u10E5\u10D5\u10D4\u10D5\u10E0\u10E8\u10D8 \u10DB\u10D6\u10D0\u10D3\u10D3\u10D4\u10D1\u10D0, \u10DB\u10D8\u10EC\u10D0\u10E8\u10D8 \u10E9\u10D0\u10E4\u10DA\u10E3\u10DA \u10D7\u10D8\u10EE\u10D8\u10E1 \u10ED\u10E3\u10E0\u10ED\u10D4\u10DA\u10E8\u10D8",
    en: "Georgian wine is traditionally made in qvevri \u2014 clay vessels buried in the ground.",
    category: "wine",
  },
  {
    ka: "\u10E5\u10D0\u10E0\u10D7\u10E3\u10DA\u10D8 \u10E1\u10E3\u10E4\u10E0\u10D0 \u10E6\u10D5\u10D8\u10DC\u10D8\u10E1 \u10D2\u10D0\u10E0\u10D4\u10E8\u10D4 \u10EC\u10D0\u10E0\u10DB\u10DD\u10E3\u10D3\u10D2\u10D4\u10DC\u10D4\u10DA\u10D8\u10D0 \u2014 \u10E6\u10D5\u10D8\u10DC\u10DD \u10E1\u10E2\u10E3\u10DB\u10D0\u10E0\u10D7\u10DB\u10DD\u10E7\u10D5\u10D0\u10E0\u10D4\u10DD\u10D1\u10D8\u10E1 \u10E1\u10D8\u10DB\u10D1\u10DD\u10DA\u10DD\u10D0",
    en: "A Georgian supra without wine is unthinkable \u2014 wine symbolizes hospitality.",
    category: "wine",
  },
  // Qvevri
  {
    ka: "\u10E5\u10D5\u10D4\u10D5\u10E0\u10E8\u10D8 \u10E6\u10D5\u10D8\u10DC\u10D8\u10E1 \u10D3\u10D0\u10E7\u10D4\u10DC\u10D4\u10D1\u10D0 2013 \u10EC\u10DA\u10D8\u10D3\u10D0\u10DC UNESCO-\u10E1 \u10D0\u10E0\u10D0\u10DB\u10D0\u10E2\u10D4\u10E0\u10D8\u10D0\u10DA\u10E3\u10E0\u10D8 \u10DB\u10D4\u10DB\u10D9\u10D5\u10D8\u10D3\u10E0\u10D4\u10DD\u10D1\u10D8\u10E1 \u10EB\u10D4\u10D2\u10DA\u10D8\u10D0",
    en: "Qvevri winemaking has been UNESCO Intangible Cultural Heritage since 2013.",
    category: "qvevri",
  },
  {
    ka: "\u10E5\u10D5\u10D4\u10D5\u10E0\u10D8 \u10E8\u10D4\u10D8\u10EB\u10DA\u10D4\u10D1\u10D0 800 \u10EC\u10D4\u10DA\u10D6\u10D4 \u10DB\u10D4\u10E2 \u10EE\u10D0\u10DC\u10E1 \u10D2\u10D0\u10DB\u10DD\u10D8\u10E7\u10D4\u10DC\u10D4\u10D1\u10DD\u10D3\u10D4\u10E1",
    en: "A qvevri can be used for over 800 years.",
    category: "qvevri",
  },
  {
    ka: "\u10E5\u10D5\u10D4\u10D5\u10E0\u10D8\u10E1 \u10DB\u10DD\u10EA\u10E3\u10DA\u10DD\u10D1\u10D0 10-\u10D3\u10D0\u10DC 10,000 \u10DA\u10D8\u10E2\u10E0\u10D0\u10DB\u10D3\u10D4 \u10DB\u10D4\u10E0\u10E7\u10D4\u10DD\u10D1\u10E1",
    en: "Qvevri range in size from 10 to 10,000 liters.",
    category: "qvevri",
  },
  // Proverbs
  {
    ka: "\u10E5\u10D0\u10E0\u10D7\u10E3\u10DA\u10D8 \u10D0\u10DC\u10D3\u10D0\u10D6\u10D0: \u10E1\u10E2\u10E3\u10DB\u10D0\u10E0\u10D8 \u10E6\u10D5\u10D7\u10D8\u10E1 \u10DB\u10DD\u10D5\u10DA\u10D8\u10DC\u10D4\u10D1\u10D0\u10D0",
    en: "Georgian proverb: 'A guest is a gift from God.'",
    category: "proverb",
  },
  {
    ka: "\u10E5\u10D0\u10E0\u10D7\u10E3\u10DA\u10D8 \u10D0\u10DC\u10D3\u10D0\u10D6\u10D0: \u10D9\u10D0\u10E0\u10D2\u10D8 \u10E1\u10D8\u10E2\u10E7\u10D5\u10D0 \u10D9\u10D0\u10E0\u10E1 \u10D2\u10D0\u10D0\u10E6\u10D4\u10D1\u10E1",
    en: "Georgian proverb: 'A kind word opens any door.'",
    category: "proverb",
  },
  {
    ka: "\u10E5\u10D0\u10E0\u10D7\u10E3\u10DA\u10D8 \u10D0\u10DC\u10D3\u10D0\u10D6\u10D0: \u10DB\u10D4\u10D2\u10DD\u10D1\u10D0\u10E0\u10D8 \u10D2\u10D0\u10ED\u10D8\u10E0\u10D5\u10D4\u10D1\u10D0\u10E8\u10D8 \u10D2\u10D0\u10DB\u10DD\u10D8\u10EA\u10DC\u10DD\u10D1\u10D0",
    en: "Georgian proverb: 'A friend is known in times of hardship.'",
    category: "proverb",
  },
  {
    ka: "\u10E5\u10D0\u10E0\u10D7\u10E3\u10DA\u10D8 \u10D0\u10DC\u10D3\u10D0\u10D6\u10D0: \u10D4\u10E0\u10D7\u10D8 \u10E4\u10E3\u10E2\u10D9\u10D0\u10E0\u10D8 \u10D1\u10D4\u10D5\u10E0 \u10D7\u10D0\u10E4\u10DA\u10E1 \u10D0\u10E0 \u10DB\u10DD\u10D8\u10E2\u10D0\u10DC\u10E1",
    en: "Georgian proverb: 'One bee doesn't bring much honey.'",
    category: "proverb",
  },
  {
    ka: "\u10E5\u10D0\u10E0\u10D7\u10E3\u10DA\u10D8 \u10D0\u10DC\u10D3\u10D0\u10D6\u10D0: \u10D5\u10D8\u10DC\u10EA \u10D0\u10E0 \u10DB\u10E3\u10E8\u10D0\u10DD\u10D1\u10E1, \u10D0\u10E0 \u10ED\u10D0\u10DB\u10E1",
    en: "Georgian proverb: 'He who doesn't work, doesn't eat.'",
    category: "proverb",
  },
  // Regions
  {
    ka: "\u10D9\u10D0\u10EE\u10D4\u10D7\u10E8\u10D8 \u10E1\u10D0\u10D3\u10E6\u10D4\u10D2\u10E0\u10EB\u10D4\u10DA\u10DD\u10D4\u10D1\u10D8 \u10D5\u10E0\u10EA\u10D4\u10DA\u10D8 \u10D3\u10D0 \u10DE\u10DD\u10D4\u10E2\u10E3\u10E0\u10D8\u10D0",
    en: "In Kakheti, toasts are elaborate and poetic, reflecting the region's deep wine culture.",
    category: "region",
  },
  {
    ka: "\u10D8\u10DB\u10D4\u10E0\u10D4\u10D7\u10D8\u10E1 \u10E1\u10E3\u10E4\u10E0\u10D0 \u10D2\u10D0\u10DB\u10DD\u10D8\u10E0\u10E9\u10D4\u10D5\u10D0 \u10DB\u10E1\u10E3\u10D1\u10E3\u10E5\u10D8, \u10EE\u10D0\u10DA\u10D8\u10E1\u10D8\u10D0\u10DC\u10D8 \u10D0\u10E2\u10DB\u10DD\u10E1\u10E4\u10D4\u10E0\u10DD\u10D7\u10D8",
    en: "Imeretian supras are known for their lighter, more playful atmosphere.",
    category: "region",
  },
  {
    ka: "\u10E1\u10D5\u10D0\u10DC\u10D4\u10D7\u10E8\u10D8 \u10E1\u10E3\u10E4\u10E0\u10D0 \u10EE\u10E8\u10D8\u10E0\u10D0\u10D3 \u10E0\u10D4\u10DA\u10D8\u10D2\u10D8\u10E3\u10E0 \u10E0\u10D8\u10E2\u10E3\u10D0\u10DA\u10D4\u10D1\u10D7\u10D0\u10DC \u10D0\u10E0\u10D8\u10E1 \u10D3\u10D0\u10D9\u10D0\u10D5\u10E8\u10D8\u10E0\u10D4\u10D1\u10E3\u10DA\u10D8",
    en: "In Svaneti, supras are often tied to religious rituals and ceremonies.",
    category: "region",
  },
  // Culture
  {
    ka: "\u10E8\u10DD\u10D7\u10D0 \u10E0\u10E3\u10E1\u10D7\u10D0\u10D5\u10D4\u10DA\u10D8\u10E1 \u10D5\u10D4\u10E4\u10EE\u10D8\u10E1\u10E2\u10E7\u10D0\u10DD\u10E1\u10D0\u10DC\u10D8 \u10D7\u10D8\u10D7\u10E5\u10DB\u10D8\u10E1 \u10E7\u10D5\u10D4\u10DA\u10D0 \u10E4\u10DD\u10E0\u10DB\u10D0\u10DA\u10E3\u10E0 \u10E1\u10E3\u10E4\u10E0\u10D0\u10D6\u10D4 \u10EA\u10D8\u10E2\u10D8\u10E0\u10D3\u10D4\u10D1\u10D0",
    en: "Shota Rustaveli's 'The Knight in the Panther's Skin' is quoted at nearly every formal supra.",
    category: "culture",
  },
  {
    ka: "\u10E5\u10D0\u10E0\u10D7\u10E3\u10DA\u10D8 \u10DE\u10DD\u10DA\u10D8\u10E4\u10DD\u10DC\u10D8\u10E3\u10E0\u10D8 \u10E1\u10D8\u10DB\u10E6\u10D4\u10E0\u10D0 UNESCO-\u10E1 \u10DB\u10D4\u10DB\u10D9\u10D5\u10D8\u10D3\u10E0\u10D4\u10DD\u10D1\u10D8\u10E1 \u10EB\u10D4\u10D2\u10DA\u10D8\u10D0",
    en: "Georgian polyphonic singing is a UNESCO Intangible Cultural Heritage.",
    category: "culture",
  },
  {
    ka: "\u10E1\u10D0\u10D3\u10E6\u10D4\u10D2\u10E0\u10EB\u10D4\u10DA\u10DD \u10D0\u10DA\u10D0\u10D5\u10D4\u10E0\u10D3\u10D8 \u10DC\u10D8\u10E8\u10DC\u10D0\u10D5\u10E1, \u10E0\u10DD\u10DB \u10E1\u10E3\u10E4\u10E0\u10D8\u10E1 \u10EC\u10D4\u10D5\u10E0\u10E1 \u10E8\u10D4\u10E3\u10EB\u10DA\u10D8\u10D0 \u10D2\u10D0\u10D0\u10D2\u10E0\u10EB\u10D4\u10DA\u10DD\u10E1 \u10D7\u10D0\u10DB\u10D0\u10D3\u10D0\u10E1 \u10E1\u10D8\u10E2\u10E7\u10D5\u10D0",
    en: "An 'alaverdi' toast means a guest may continue the tamada's theme in their own words.",
    category: "culture",
  },
  {
    ka: "\u10DE\u10D8\u10E0\u10D5\u10D4\u10DA\u10D8 \u10E1\u10D0\u10D3\u10E6\u10D4\u10D2\u10E0\u10EB\u10D4\u10DA\u10DD \u10E7\u10DD\u10D5\u10D4\u10DA\u10D7\u10D5\u10D8\u10E1 \u10E6\u10D5\u10D7\u10D8\u10E1 \u10D0\u10DC \u10E3\u10E4\u10DA\u10D8\u10E1 \u10E1\u10D0\u10D3\u10D8\u10D3\u10D4\u10D1\u10DA\u10D0\u10D3 \u10D8\u10D7\u10E5\u10DB\u10D8\u10E1",
    en: "The first toast is always raised to God or the Creator.",
    category: "culture",
  },
  {
    ka: "\u10E5\u10D0\u10E0\u10D7\u10E3\u10DA \u10E1\u10E3\u10E4\u10E0\u10D0\u10D6\u10D4 \u10D0\u10E0\u10D0\u10D5\u10D8\u10DC \u10E1\u10D5\u10D0\u10DB\u10E1 \u10E1\u10D0\u10D3\u10E6\u10D4\u10D2\u10E0\u10EB\u10D4\u10DA\u10DD\u10E1 \u10D2\u10D0\u10E0\u10D4\u10E8\u10D4 \u2014 \u10D4\u10E1 \u10E3\u10EE\u10D4\u10E8\u10DD\u10D1\u10D0\u10D3 \u10D8\u10D7\u10D5\u10DA\u10D4\u10D1\u10D0",
    en: "At a Georgian supra, no one drinks without a toast \u2014 it's considered rude.",
    category: "culture",
  },
  // Food
  {
    ka: "\u10EE\u10D8\u10DC\u10D9\u10D0\u10DA\u10D8 \u2014 \u10E5\u10D0\u10E0\u10D7\u10E3\u10DA\u10D8 \u10E1\u10E3\u10E4\u10E0\u10D8\u10E1 \u10D4\u10E0\u10D7-\u10D4\u10E0\u10D7\u10D8 \u10E7\u10D5\u10D4\u10DA\u10D0\u10D6\u10D4 \u10E1\u10D0\u10E7\u10D5\u10D0\u10E0\u10D4\u10DA\u10D8 \u10D9\u10D4\u10E0\u10EB\u10D8\u10D0",
    en: "Khinkali \u2014 Georgian dumplings \u2014 are one of the most beloved supra dishes.",
    category: "food",
  },
  {
    ka: "\u10E9\u10E3\u10E0\u10E9\u10EE\u10D4\u10DA\u10D0\u10E1 \u10E5\u10D0\u10E0\u10D7\u10E3\u10DA \u10E1\u10DC\u10D8\u10D9\u10D4\u10E0\u10E1\u10E1 \u10D4\u10EB\u10D0\u10EE\u10D8\u10D0\u10DC \u2014 \u10D4\u10E1 \u10EB\u10D5\u10D4\u10DA\u10D8 \u10E5\u10D0\u10E0\u10D7\u10E3\u10DA\u10D8 \u10E2\u10D9\u10D1\u10D8\u10DA\u10D4\u10E3\u10DA\u10D8\u10D0",
    en: "Churchkhela is called 'Georgian Snickers' \u2014 it's an ancient Georgian candy.",
    category: "food",
  },
  {
    ka: "\u10E1\u10D0\u10E5\u10D0\u10E0\u10D7\u10D5\u10D4\u10DA\u10DD\u10E8\u10D8 \u10DE\u10E3\u10E0\u10D8\u10E1 \u10D2\u10D0\u10DB\u10DD\u10EA\u10EE\u10DD\u10D1\u10D0 \u10E1\u10D0\u10D9\u10E0\u10D0\u10DA\u10E3\u10E0\u10D8 \u10DE\u10E0\u10DD\u10EA\u10D4\u10E1\u10D8\u10D0 \u2014 \u10E8\u10DD\u10D7\u10D8 \u10E2\u10E0\u10D0\u10D3\u10D8\u10EA\u10D8\u10E3\u10DA\u10D8 \u10D7\u10DD\u10DC\u10D8\u10E1 \u10DE\u10E3\u10E0\u10D8\u10D0",
    en: "Bread-baking is sacred in Georgia \u2014 shotis puri is the traditional tandoor bread.",
    category: "food",
  },
  // Dance traditions
  {
    ka: "ქართული ცეკვა „კართული" სიყვარულის ამბავს მოგვითხრობს — მამაკაცი ქალს მოწიწებით უვლის",
    en: "The 'Kartuli' dance tells a love story — the man courts the woman with grace and reverence.",
    category: "dance",
  },
  {
    ka: "ცეკვა „ხორუმი" ომის ცეკვაა — 40-მდე მეომარი სინქრონულად მოძრაობს",
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
    en: "Georgian men dance on their toes without pointe shoes — only in soft leather boots.",
    category: "dance",
  },
  {
    ka: "„მთიულური" ცეკვა მთიელთა ძალასა და სიმამაცეს ასახავს",
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
    en: "Queen Tamar ruled Georgia's Golden Age — the first woman monarch in the Caucasus.",
    category: "history",
  },
  {
    ka: "შოთა რუსთაველი XII საუკუნის პოეტია — „ვეფხისტყაოსანი" მსოფლიო ლიტერატურის შედევრია",
    en: "Shota Rustaveli, the 12th-century poet, wrote 'The Knight in the Panther's Skin' — a world literary masterpiece.",
    category: "history",
  },
  {
    ka: "ნიკო ფიროსმანი — თვითნასწავლი მხატვარი, რომლის ნამუშევრები მსოფლიო მუზეუმებშია",
    en: "Niko Pirosmani was a self-taught painter whose works hang in museums worldwide.",
    category: "culture",
  },
  {
    ka: "ილია ჭავჭავაძე „ერის მამას" უწოდებენ — თანამედროვე ქართული ერის ფუძემდებელი",
    en: "Ilia Chavchavadze is called the 'Father of the Nation' — founder of modern Georgian identity.",
    category: "history",
  },
  // Architecture
  {
    ka: "ჯვარის მონასტერი (VI ს.) UNESCO-ს მსოფლიო მემკვიდრეობის ძეგლია",
    en: "Jvari Monastery (6th century) is a UNESCO World Heritage Site overlooking Mtskheta.",
    category: "architecture",
  },
  {
    ka: "სვანური კოშკები თავდაცვის მიზნით აშენდა — ზოგიერთი 1000 წელზე მეტის არის",
    en: "Svan towers were built for defense — some are over 1,000 years old and still standing.",
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
    ka: "თბილისის აბანოთუბანი ცნობილია გოგირდის აბანოებით — ქალაქის სახელიც „თბილი" წყალს ნიშნავს",
    en: "Tbilisi's Abanotubani is famous for its sulfur baths — the city's name means 'warm waters.'",
    category: "architecture",
  },
  // Regional cuisine differences
  {
    ka: "კახეთში მწვადი და ბადრიჯნის როლი ძირითადია — მუქი ღვინო სამზარეულოში ყველგანაა",
    en: "In Kakheti, grilled meats and eggplant rolls dominate — rich red wine is in every dish.",
    category: "cuisine",
  },
  {
    ka: "იმერეთში ხაჭაპური თხელია და ნაკლები ყველით — იმერული ხაჭაპური ყველაზე პოპულარულია",
    en: "In Imereti, khachapuri is thin with less cheese — Imeruli khachapuri is the most popular nationwide.",
    category: "cuisine",
  },
  {
    ka: "აჭარაში ხაჭაპური ნავის ფორმისაა, კვერცხითა და კარაქით — „აჭარული"",
    en: "In Adjara, khachapuri is boat-shaped with egg and butter — the famous 'Adjaruli.'",
    category: "cuisine",
  },
  {
    ka: "მეგრეულ სამზარეულოში ცხარე აჯიკა და გებჟალია ხაშხაშია — ნამდვილი სპაისი",
    en: "Megrelian cuisine is the spiciest in Georgia — ajika sauce and gebzhalia cheese are fiery staples.",
    category: "cuisine",
  },
  {
    ka: "ფხალი — სხვადასხვა ბოსტნეულისგან მომზადებული ნიგვზიანი პასტა, ყველა რეგიონს თავისი აქვს",
    en: "Pkhali is a walnut-herb paste made from different greens — every region has its own version.",
    category: "cuisine",
  },
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
  dance: "💃",
  architecture: "🏛️",
  cuisine: "🧑‍🍳",
};
