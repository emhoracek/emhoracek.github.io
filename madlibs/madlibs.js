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
      var plain = match[1];
      var madword = { num: i.toString(), original: match[2], current: "", type: match[3] };
      text.push( plain );
      text.push( madword );
      rest_of_story = match[4];
      match = match_slow.exec(rest_of_story);
    }
    text.push(rest_of_story);
    return text;
}

// Now for the React!!

var Prompt = React.createClass({
  handleChange: function(e) {
    this.props.onChange({ word_id: this.props.word.num, 
                          new_word: e.target.value});
  },
  render: function(){
    return (
      <li>
      <label className="prompt-label">{this.props.word.type}</label>
      <input type="text"
             onChange={this.handleChange} 
             value={this.props.word.current}
             className="prompt-input"/>
      </li>
    )
  }
});

var SetOfPrompts = React.createClass({
  handleChange: function(word){
    this.props.onChange(word);
  },
  render: function () {
    var prompts = this.props.children;
    return (
      <ul className="list-prompts">
      { prompts }
      </ul>
      )
  }
});

var MadWord = React.createClass({
  render: function() {
    return <span className="madword">{this.props.word.current}</span>
  }
});

var MadStory = React.createClass({
  render: function(){
    var story = this.props.story;
    story = story.map(function(element) {
      if ((typeof element) == "string") {
        return <span>{ element }</span>
      }
      else {
        return <MadWord key={element.num} word={element} />
      }
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
      story: this.state.story.map( function (x) {
        if ((typeof x) != "string") {
          x.current = "";
        }
        return x;
      })
    })
  },
  changeStory: function(story_text, word_id, new_word) {
    var story = story_text.map ( function (x) {
      if (x.num == word_id) {
        x.current = new_word;
      }
      return x;
    });
    return story;
  },
  handleChange: function(word) {
    var newStory = this.changeStory(this.state.story, word.word_id, word.new_word);
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
    var words = this.state.story.filter(function(x) { return ((typeof x) != "string") });
    if (this.state.visible) {
      var submit = "hide";
    }
    else {
      var submit = "show";
    }
    var that = this;
    var prompts = words.map(function(word) {
      return (
        <Prompt key={word.num} word={word} onChange={that.handleChange} onClear={that.clearPrompts} />
      )});
    return (
      <div className="madlibs">
        <SetOfPrompts words={words} onChange={this.handleChange}> { prompts } </SetOfPrompts>
        <button onClick={this.toggleVisibility}> {submit} </button>
        <button onClick={this.clearPrompts}> clear </button>
        <MadStory story={this.state.story} visible={this.state.visible}  />
      </div>
      )
  }
});

var onChange = function(self){
    var words = self.state.story.filter(function(x) { return ((typeof x) != "string") });
    if (self.state.visible) {
      var submit = "hide";
    }
    else {
      var submit = "show";
    }
    var that = self;
    var prompts = words.map(function(word) {
      return (
        <Prompt key={word.num} word={word} onChange={that.handleChange} onClear={that.clearPrompts} />
      )});
    React.render (
      <div className="madlibs">
        <SetOfPrompts words={words} onChange={self.handleChange}> { prompts } </SetOfPrompts>
        <button onClick={self.toggleVisibility}> {submit} </button>
        <button onClick={self.clearPrompts}> clear </button>
        <MadStory story={self.state.story} visible={self.state.visible}  />
      </div>
      )
};

React.render(<MadLibs />, document.getElementById('madlibs'));
