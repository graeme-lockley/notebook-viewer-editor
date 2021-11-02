import React from "react"
import "./App.css";
import { BsBraces, BsChevronDown, BsChevronRight, BsCodeSlash, BsFillPinFill, BsPin } from "react-icons/bs";
import { CodeMirror } from "./components/CodeMirror";

const NotebookEntryType_JAVASCRIPT = 0;
// const NotebookEntryType_MARKDOWN = 1;
const NotebookEntryType_HTML = 2;
// const NotebookEntryType_TEX = 3;

const notebook = [
  {
    id: 1,
    type: NotebookEntryType_HTML,
    text: "Hello <strong>world</strong>",
    pinned: false
  },
  {
    id: 2,
    type: NotebookEntryType_JAVASCRIPT,
    text: "{ const xx = [1, 2, 3, 4];\n  xx.map((x) => x + 1); }",
    pinned: true
  }
];

function Gutter(props) {
  if (props.value.state.focus)
    return <div className="FocusGutter" ><p /></div>

  return <div className="Gutter" ><p /></div>
}

class GutterChevron extends React.Component {
  constructor(props) {
    super(props);

    this.clickChevron = this.clickChevron.bind(this);
  }

  clickChevron() {
    this.props.value.attemptToggleChevron();
  }

  render() {
    if (!this.props.value.state.focus)
      return <Gutter value={this.props.value} />

    if (!this.props.value.state.open)
      return <div className="PointerGutter" onClick={this.clickChevron}><BsChevronRight size="0.7em" /></div>

    if (this.props.value.state.pinned)
      return <div className="FocusGutter" onClick={this.clickChevron}><BsChevronDown size="0.7em" /></div>

    return <div className="PointerGutter" onClick={this.clickChevron}><BsChevronDown size="0.7em" /></div>
  }
}

class GutterPin extends React.Component {
  constructor(props) {
    super(props);

    this.clickPin = this.clickPin.bind(this);
  }

  clickPin() {
    this.props.value.attemptTogglePin();
  }

  render() {
    if (!this.props.value.state.focus)
      return <Gutter value={this.props.value} />

    if (this.props.value.state.pinned)
      return <div className="PointerGutter" onClick={this.clickPin}><BsFillPinFill size="0.7em" /></div>

    return <div className="PointerGutter" onClick={this.clickPin}><BsPin size="0.7em" /></div>
  }
}

function GutterEntryType(props) {
  if (!props.value.state.focus)
    return <div className="Gutter" ><p /></div>

  const type = props.value.state.model.type;

  return (type === NotebookEntryType_HTML)
    ? <div className="FocusGutter"><BsCodeSlash size="0.7em" /></div>
    : <div className="FocusGutter"><BsBraces size="0.7em" /></div>;
}

function EntryResults(props) {
  return (<div
    className={`NotebookBody-${props.result.status}`}
    dangerouslySetInnerHTML={{ __html: props.result.text }}
  />);
}

class NotebookEntry extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      model: props.value,
      text: props.value.text,
      pinned: props.value.pinned,
      open: props.value.pinned,
      focus: false
    };

    this.focusOn = this.focusOn.bind(this);
    this.focusOff = this.focusOff.bind(this);
    this.changeText = this.changeText.bind(this);
  }

  attemptToggleChevron() {
    this.setState(state => ({ open: state.pinned ? true : !state.open }));
  }

  attemptTogglePin() {
    this.setState(state => ({ pinned: !state.pinned }));
  }

  toHTML() {
    const type = this.state.model.type;

    try {
      // eslint-disable-next-line
      const text = (type === NotebookEntryType_HTML) ? this.state.text : eval(this.state.text);
      return { status: 'OK', text };
    } catch (e) {
      return { status: 'ERROR', text: e.message };
    }
  }

  focusOn() {
    this.setState(state => ({ focus: true }));
  }

  focusOff() {
    this.setState(state => ({ focus: false }));
  }

  changeText(text, change) {
    this.setState(state => ({ text }));
  }

  render() {
    const html = this.toHTML();

    if (this.state.open)
      return (<div className="NotebookEntry" onMouseEnter={this.focusOn} onMouseLeave={this.focusOff}>
        <div className="Upper">
          <GutterChevron value={this} />
          <Gutter value={this} />
          <EntryResults result={html} />
        </div>
        <div className="Lower">
          <GutterPin value={this} />
          <GutterEntryType value={this} />
          <div className="NotebookBody">
            <CodeMirror
              value={this.state.text}
              onChange={this.changeText}
              options={{
                viewportMargin: Infinity,
                lineNumbers: false,
                lineWrapping: true,
                mode: this.state.model.type === NotebookEntryType_HTML ? "htmlmixed" : "javascript"
              }}
            />
          </div>
        </div>
      </div>);

    return (<div className="NotebookEntry" onMouseEnter={this.focusOn} onMouseLeave={this.focusOff}>
      <div className="Closed">
        <GutterChevron value={this} />
        <Gutter value={this} />
        <EntryResults result={html} />
      </div>
    </div>);
  }
}

function App() {
  const notebookEntries = notebook.map((entry) =>
    <NotebookEntry key={entry.id} value={entry} />
  );

  return (
    <div className="Notebook">
      {notebookEntries}
    </div>
  );
}

export default App;
