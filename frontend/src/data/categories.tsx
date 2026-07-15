import {
  PiCouchDuotone,
  PiPottedPlantDuotone,
  PiTrophy,
  PiYarnDuotone,
} from "react-icons/pi";

export interface SubFilter {
  name: string;
  label: string;
}

export interface CategoryDef {
  id: number;
  name: string;
  label: string;
  icon: React.ReactNode;
  subFilters: Array<SubFilter>;
}

export const categories: Array<CategoryDef> = [
  {
    id: 393,
    name: "sofa",
    label: "مبلمان",
    icon: <PiCouchDuotone />,
    subFilters: [
      { name: "all", label: "همه" },
      { name: "chesterfield", label: "چسترفیلد" },
      { name: "cabriole", label: "کبریل" },
      { name: "lawson", label: "لاوسون" },
      { name: "chaise", label: "چِیس" },
      { name: "sectional", label: "قطعه‌ای" },
    ],
  },
  {
    id: 459,
    name: "handingcraft",
    label: "صنایع دستی",
    icon: <PiTrophy />,
    subFilters: [
      { name: "all", label: "همه" },
      { name: "wall-art", label: "تابلو" },
      { name: "painting", label: "طرح و نقاشی" },
      { name: "copperware", label: "ظروف مسی" },
      { name: "statue", label: "مجسمه" },
    ],
  },
  {
    id: 434,
    name: "pottery",
    label: "سفال",
    icon: <PiPottedPlantDuotone />,
    subFilters: [
      { name: "all", label: "همه" },
      { name: "plate", label: "بشقاب" },
      { name: "cup", label: "لیوان" },
      { name: "jug", label: "پارچ" },
      { name: "vase", label: "گلدان" },
    ],
  },
  {
    id: 643,
    name: "carpet-and-knitting",
    label: "فرش و بافتنی",
    icon: <PiYarnDuotone />,
    subFilters: [
      { name: "all", label: "همه" },
      { name: "hunting-ground", label: "شکارگاهی" },
      { name: "shah-abbasi", label: "شاه عباسی" },
      { name: "tableau", label: "تابلو فرش" },
      { name: "tree", label: "درختی" },
    ],
  },
];
