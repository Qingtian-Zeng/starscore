import { useEffect, useRef, type RefObject } from "react";

export function useDialogFocus(ref: RefObject<HTMLElement | null>, open: boolean, close: () => void) {
  const closeRef=useRef(close);closeRef.current=close;
  useEffect(()=>{
    if(!open||!ref.current)return;
    const previous=document.activeElement as HTMLElement|null;
    const previousOverflow=document.body.style.overflow;
    document.body.style.overflow="hidden";
    const controls=()=>Array.from(ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled):not([type="file"]),textarea:not(:disabled),select:not(:disabled),a[href],[tabindex="0"]')??[]);
    (ref.current.querySelector<HTMLElement>('[data-autofocus]')??controls()[0]??ref.current).focus();
    const onKey=(event:KeyboardEvent)=>{
      if(event.key==="Escape"){event.preventDefault();closeRef.current();return}
      if(event.key!=="Tab")return;
      const elements=controls();const first=elements[0],last=elements.at(-1);
      if(!first){event.preventDefault();ref.current?.focus();return}
      if(event.shiftKey&&(document.activeElement===first||!ref.current?.contains(document.activeElement))){event.preventDefault();last?.focus()}
      else if(!event.shiftKey&&(document.activeElement===last||!ref.current?.contains(document.activeElement))){event.preventDefault();first.focus()}
    };
    document.addEventListener("keydown",onKey);
    return()=>{document.body.style.overflow=previousOverflow;document.removeEventListener("keydown",onKey);if(previous?.isConnected)previous.focus()};
  },[open,ref]);
}
