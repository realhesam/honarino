import InputRow from "@/ui/InputRow";
import LinkButton from "@/ui/LinkButton";
import Modal from "@/ui/Modal";

function submitForm(e: FormDataEvent) {
  e.preventDefault();
  // ...
}

export default function SearchForm() {
  return (
    <div>
      <form onSubmit={submitForm}>
        <div className="grid xs:grid-cols-2 gap-2.5">
          <InputRow label="نام تولیدی">
            <input
              type="text"
              className="input"
              placeholder="نام تولیدی مورد نظر"
            />
          </InputRow>
          <InputRow label="نام محصول">
            <input
              type="text"
              className="input"
              placeholder="نام محصول مورد نظر"
            />
          </InputRow>
          <InputRow label="دسته بندی">
            <select className="input">
              <option value="all">جست و جو در همه</option>
              <option value="sofa">مبلمان</option>
              <option value="handmade">صنایع دستی</option>
              <option value="pottery">سفال</option>
              <option value="carpet">فرش و بافتنی</option>
            </select>
          </InputRow>
          <InputRow label="استان">
            <input
              type="text"
              className="input"
              placeholder="نام استان مورد نظر را وارد کنید"
            />
          </InputRow>
        </div>
        <div className="flex gap-2 items-center justify-center mt-5">
          <LinkButton type="submit">جست و جو</LinkButton>

          <Modal.Close>
            <LinkButton type="button" variation="btn-danger">
              لغو
            </LinkButton>
          </Modal.Close>
        </div>
      </form>
    </div>
  );
}
