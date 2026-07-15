"use client";

import { useOutsideClick } from "@/utils/useOutsideClick";
import React, {
  cloneElement,
  createContext,
  useContext,
  useState,
} from "react";
import { createPortal } from "react-dom";
import LinkButton from "./LinkButton";
import Overlay from "./Overlay";
import { HiOutlineXMark } from "react-icons/hi2";

interface ModalContextType {
  openName: string | boolean;
  open: React.Dispatch<React.SetStateAction<string | boolean>>;
  close: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

function useModalContext() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("Modal compound components must be used within <Modal>");
  }
  return context;
}

function Modal({ children }: Readonly<{ children: React.ReactNode }>) {
  const [openName, setOpenName] = useState<string | boolean>("");
  const open = setOpenName;
  const close = () => setOpenName("");

  return (
    <ModalContext.Provider value={{ openName, open, close }}>
      {children}
    </ModalContext.Provider>
  );
}

type ClickableElement = React.ReactElement<{ onClick?: () => void }>;

function Open({
  children,
  name,
}: {
  children: ClickableElement;
  name: string;
}) {
  const { open } = useModalContext();

  return cloneElement(children, {
    onClick: () => open(name),
  });
}

function Close({ children }: { children: ClickableElement }) {
  const { close } = useModalContext();
  return cloneElement(children, { onClick: close });
}

function Window({
  children,
  name,
  label,
  icon,
}: {
  children: React.ReactElement;
  name: string;
  label: string;
  icon: React.ReactElement;
}) {
  const { openName, close } = useModalContext();
  const { ref } = useOutsideClick<HTMLDivElement>(close);

  if (openName !== name) return null;

  return createPortal(
    <>
      <Overlay />
      <div
        ref={ref}
        className="fixed p-5 max-w-300 h-fit inset-0 mx-10 my-auto xl:m-auto bg-white rounded-xl z-50 pt-13"
      >
        <div className="p-2 flex items-center justify-between absolute top-0 inset-x-0 border-b border-stone-200 bg-stone-100 rounded-t-xl">
          <h4 className="flex items-center gap-2">
            <span className="size-3.5 text-stone-600">{icon}</span>
            <span>{label}</span>
          </h4>
          <LinkButton
            onClick={close}
            size="btn-sm btn-danger"
            variation="*:size-5 "
          >
            <HiOutlineXMark />
          </LinkButton>
        </div>
        <div>{children}</div>
      </div>
    </>,
    document.body,
  );
}

Modal.Open = Open;
Modal.Close = Close;
Modal.Window = Window;
export default Modal;