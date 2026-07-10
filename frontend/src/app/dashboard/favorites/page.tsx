import Section from "@/layout/Section";
import { HiMiniHeart } from "react-icons/hi2";

export default function FavoritePage() {
  return (
    <div>
      {
        <Section
          smallSize={true}
          hasViewMore={false}
          icon={<HiMiniHeart />}
          title="تولیدی های محبوب"
        >
          {/* {DATA.map((production, i) => (
            <div key={i}>{production.name}</div>
          ))} */}
        </Section>
      }
    </div>
  );
}
