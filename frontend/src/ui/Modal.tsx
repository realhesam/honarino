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

const ModalContext = createContext({});

function Modal({ children }: Readonly<{ children: React.ReactNode }>) {
  const [openName, setOpenName] = useState<string | boolean>("");
  const open = setOpenName;
  const close = () => setOpenName("");

  return (
    <ModalContext value={{ openName, open, close }}>{children}</ModalContext>
  );
}

function Open({
  children,
  name,
}: {
  children: React.ReactElement;
  name: string;
}) {
  const { open } = useContext(ModalContext);

  return cloneElement(children, {
    onClick: () => open(name),
  });
}

function Window({
  children,
  name,
}: {
  children: React.ReactElement;
  name: string;
}) {
  const { openName, close } = useContext(ModalContext);
  const { ref } = useOutsideClick(close);

  if (openName !== name) return;

  return createPortal(
    <>
      <Overlay />
      <div
        ref={ref}
        className="absolute inset-0 m-auto w-100 h-50 bg-white z-50"
      >
        <LinkButton onClick={close} variation="btn-light">
          <HiOutlineXMark />
        </LinkButton>
        <div>{children}</div>
      </div>
    </>,
    document.body,
  );
}

Modal.Open = Open;
Modal.Window = Window;
export default Modal;
