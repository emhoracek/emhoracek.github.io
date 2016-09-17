/*
 * MADLIBS!! by Libby
 * for Flocabulary
 *
 */

// Make a story!
// It's easier if you don't have to use lots of ugly HTML tags.
// So here's a very pretty syntax for making madlibs! Just wrap every
// "mad" word in braces. The first word is the original word, and the
// second is your description.
var sample_story =
"JavaScript is built on some very { good, adjective } ideas and a few very " +
"{ bad, adjective } ones. The very { good, adjective } ideas include " +
"{ functions, plural noun }, { loose, adjective } typing, " +
"{ dynamic, adjective }  objects, and an expressive object literal " +
"{ notation, noun }. The { bad, adjective } ideas include a programming " +
"model based on global { variables, plural noun }. JavaScript’s functions " +
"are first class  { objects, plural noun } with (mostly) " +
    "{ lexical, adjective }  scoping. ";

// Next some resources for parsing the story into things we can use with React.

// Regular expressions are pretty awesome.
var match_words = /(\{)(?:[^\}])*(\})/g;
// Gets rid of brackets and separates original word and word type
var parse_match = /\{\s?(.+),\s?(.+)\s?\}/;

// this returns an array of words and objects representing the story
var parse_story = function(story) {
    var text = [];
    // This matches one bunch of plain words and one mad word at a time,
    // and then the rest of the story.
    var match_slow = /([^\{]+)\{\s?([^,]+),\s?([^\}]+)\s?\}(.*$)/
    var match = match_slow.exec(story);
    for (var i = 0; match != null; i++) {
      var plain = { type: "text",
                    text: match[1] };
      var madword = { type: "mad",
                      original: match[2],
                      current: "",
                      part_of_speech: match[3] };
      text.push( plain );
      text.push( madword );
      rest_of_story = match[4];
      match = match_slow.exec(rest_of_story);
    }
    text.push({ type: "text",
                text: rest_of_story });
    return text;
}

// Now for the React!!


var MadPreview = React.createClass({
  textToStory: function(text) {
    console.log(text);
    story = text.split(' ').map(function (word) {
      return { type: "text",
               text: word }
    });
    return story;
  },
  render: function() {
    return (
        <div className="preview">
          <MadStory story={this.textToStory(this.props.text)} visible="true"  />
        </div>
    )
  }
});

var MadEditor = React.createClass({
  getInitialState: function(){
    return {
      text: "",
      story: []
    }
  },
  handleChange: function (e) {
    console.log(this.props);
    console.log(e.target.value);
    this.setState ({
      text: e.target.value
    });
  },
  render: function(){
    return (
      <div className="editor">
        <textarea onChange={ this.handleChange }/>
        <MadPreview text={ this.state.text } />
      </div>
    )
  }
});

var Prompt = React.createClass({
  handleChange: function(e) {
    console.log(this.props);
    console.log(e.target.value);
    this.props.onChange({ word_id: this.props.word_id,
                          new_word: e.target.value});
  },
  render: function(){
    return (
      <li>
      <label className="prompt-label">{this.props.word.part_of_speech}</label>
      <input type="text"
             onChange={this.handleChange}
             value={this.props.word.current}
             className="prompt-input"/>
      </li>
    )
  }
});

var SetOfPrompts = React.createClass({
  render: function () {
    var that = this;
    var prompts = this.props.words.map(function(word, i) {
      if (word.type === "mad") {
        return (
            <Prompt key={i} word={word} word_id={i} onChange={that.props.onChange} onClear={that.props.onClear} />
        )
      }
    });
    return (
      <ul className="list-prompts">
        { prompts }
      </ul>
      )
  }
});

var MadWord = React.createClass({
  render: function() {
    var type = this.props.word.type
    var word = this.props.word;
    if (type == "text") {
      return <span>{ word.text } </span>
    } else {
      return <span className="madword">{ word.current }</span>
    }
  }
});

var MadStory = React.createClass({
  render: function(){
    var story = this.props.story;
    story = story.map(function(word, i) {
      return <MadWord key={i} type={word.type} word={word} />
    });
    if (this.props.visible) {
      var visibleClass = "madstory";
    }
    else {
      var visibleClass = "madstory hidden";
    }
    return (
      <p className={ visibleClass }>
        { story }
      </p>
    )
  }
});

var MadLibs = React.createClass({
  getInitialState: function(){
    return {
      story: parse_story(sample_story),
      visible: false,
    }
  },
  clearPrompts: function() {
    this.setState ({
      story: this.state.story.map( function (word) {
        if (word.type === "mad") {
          word.current = "";
        }
        return x;
      })
    })
  },
  changeStory: function(story_text, word_id, new_word) {
    var story = story_text.map ( function (word, i) {
      if (i == word_id) {
        word.current = new_word;
      }
      return word;
    });
    return story;
  },
  handleChange: function(word_info) {
    console.log(word_info);
    var newStory = this.changeStory(this.state.story, word_info.word_id, word_info.new_word);
    this.setState ({
      story: newStory
    });
  },
  toggleVisibility: function() {
    if (this.state.visible) {
      this.setState ({
        visible: false
      });
    }
    else {
      this.setState ({
        visible: true
      });
    }
  },
  render: function() {
    var words = this.state.story.filter(function(x) { return (x.type === "mad") });
    return (
      <div className="madlibs">
        <SetOfPrompts words={this.state.story} onChange={this.handleChange} onClear={this.clearPrompts} />
        <button onClick={this.toggleVisibility}> { this.state.visible ? "hide" : "show" } </button>
        <button onClick={this.clearPrompts}> clear </button>
        <MadStory story={this.state.story} visible={this.state.visible}  />
        <MadEditor />
      </div>
    )
  }
});

React.render(<MadLibs />, document.getElementById('madlibs'));

if (typeof window !== 'undefined') {
    window.React = React;
}
