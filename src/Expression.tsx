import { Dropdown, Menu } from "antd";
import { debounce, last } from "lodash";
import React, { useEffect, useRef, useState } from "react";
import ContentEditable from "react-contenteditable";
import './index.less';

let expressionChildIdx = 0; // save the node where the cursor is located
let expressionAnchorIndex = 0; // save the offset where the cursor is located

interface IHtmlValue {
  value: string;
  html: string;
}

interface IOptions {
  key: string;
  label: string;
  type?: string;
  children?: IOptions[]
}

interface IProps {
  value?: IHtmlValue;
  options: IOptions[];
  onChange?: ({ html, value }: IHtmlValue) => void;
}

const regHtmlTags = /<[^<>]+>/g;

const Expression = (props: IProps) => {
  const { options } = props;
  const getDefaultCompilerOptions = () => {
    const defaultOptions = options;
    return defaultOptions;
  };

  const [localOptions, setLocalOptions] = useState<any>(getDefaultCompilerOptions());
  const [html, setHtml] = useState<string>(props?.value?.html || "");


  useEffect(() => {
    setHtml(props?.value?.html || "");
  }, [props]);

  const handleChange = (evt: any) => {
    setHtml(evt.target.value);
  };

  const getNewHtml = (key: string) => {
    let html = `<span class="is-editor-variable" contentEditable=false>${key}</span>`;
    return html;
  };

  const onClick = (item: { key: any; type?: string }) => {
    const key = item.key;
    let newHtml = "";
    const childNodes: any = ref?.current?.childNodes;
    const l = childNodes.length || 0;
    if (!l) {
      newHtml = getNewHtml(key);
    }
    for (let i = 0; i < l; i++) {
      const text = childNodes[i].data || "";
      if (i === expressionChildIdx) {
        let cur = getNewHtml(key);
        const isNotContenteditable =
          expressionAnchorIndex === 0 &&
          childNodes[i].nodeName === "SPAN" &&
          childNodes[i].getAttribute("contenteditable") === "false";
        if (isNotContenteditable) {
          newHtml = newHtml + cur + (childNodes[i].outerHTML || "");
        } else {
          const pre = text
            .slice(0, expressionAnchorIndex)
            .replace(/[a-zA-Z0-9_.]+$/, "");
          const sur = text
            .slice(expressionAnchorIndex)
            .replace(/^[a-zA-Z0-9_.]+/, "");
          newHtml = newHtml + `${pre}${cur}${sur}`;
        }
      } else {
        newHtml = newHtml + (childNodes[i].outerHTML || text || "");
      }
    }
    const temp = newHtml.trim();
    setHtml(temp);
    props.onChange?.({
      html: temp,
      value: temp.replace(regHtmlTags, ""),
    });
  };

  const changeExpressionChildIdx = () => {
    const childNodes: any[] | NodeListOf<ChildNode> = ref?.current?.childNodes || [];
    const selection = window.getSelection() as any;
    const range = selection.getRangeAt(0);
    const isRichEditable = range.startContainer === ref?.current;
    const isText =
      range.startContainer?.nodeName === "#text" &&
      range.startContainer.parentNode === ref?.current;
    if (isRichEditable) {
      expressionChildIdx = range.startOffset;
      expressionAnchorIndex = 0;
      return;
    }
    if (isText) {
      childNodes.forEach((child, index) => {
        if (child === range.startContainer) {
          expressionChildIdx = index;
          expressionAnchorIndex = selection.anchorOffset;
        }
      });
      return;
    }
    expressionChildIdx = childNodes.length ? childNodes.length - 1 : 0;
    expressionAnchorIndex = 0;
  };

  const onKeyUp = (e: React.KeyboardEvent<HTMLDivElement>) => {
    changeExpressionChildIdx();
    let data = "";
    const childNodes = (e.target as any).childNodes;
    const selection = window.getSelection() as any;

    for (let i = 0; i < childNodes.length; i++) {
      if (childNodes[i] === selection!.baseNode) {
        data = childNodes[i].data;
      }
    }
    onSearch(data);

    const temp = ref.current?.innerHTML.trim() || "";
    props.onChange?.({
      html: temp,
      value: temp.replace(regHtmlTags, ""),
    } as IHtmlValue);
  };
  const onSearch = (value: string = "") => {
    const defaultOptions = getDefaultCompilerOptions();
    if (!value) {
      setLocalOptions([...defaultOptions]);
      return;
    }
    const reg = /[a-zA-Z0-9_.]+/g;
    const text = value?.slice(0, expressionAnchorIndex);
    const matchText = (last(text.match(reg)) || "").trim();
    if (!matchText) {
      setLocalOptions([...defaultOptions]);
      return;
    }
    const temp = defaultOptions.filter((option, index) => {
      return option.key.includes(matchText);
    })
    setLocalOptions(temp);
  };

  const ref = useRef<HTMLElement>(null);
  return (
    <Dropdown
      overlay={
        <Menu
          items={localOptions}
          onClick={onClick}
          style={{ height: "300px", overflowY: "auto" }}
        ></Menu>
      }
    >
      <ContentEditable
        innerRef={ref}
        html={html}
        disabled={false}
        onChange={handleChange}
        onKeyUp={debounce(onKeyUp, 500)}
        onMouseUp={changeExpressionChildIdx}
        className="rich-editable"
      ></ContentEditable>
    </Dropdown>
  );
};

export default Expression;
