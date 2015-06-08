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
      var madword = { num: i.toString(), original: match[2], current: match[2] };
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
    this.props.onChange({ word_id: this.props.word.id, 
                          new_word: e.target.value});
  },
  render: function(){
    return (
      <li>
      <label className="prompt-label">{this.props.word.type}</label>
      <input type="text"  
             onChange={this.handleChange} 
             className="prompt-input"/>
      </li>
    )
  }
});

var SetOfPrompts = React.createClass({
  handleChange: function(word){
    this.props.onChange(word);
  },
  render: function(){
    var id = 0;
    var that = this;
    var prompts = this.props.words.map(function(tuple) {
      arr = parse_match.exec(tuple);
      var word = { id: id.toString(), original: arr[1], type: arr[2] };
      id = id + 1;
      return (
        <Prompt word={word} onChange={that.handleChange} />
      )});
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
        return <MadWord word={element} />
      }
    });
    if (this.props.visible) {
      var visibleClass = "madstory visible";
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
      story: parse_story(this.props.story),
      visible: false,
    }
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
  handleChange: function(e) {
    var newStory = this.changeStory(this.state.story, e.word_id, e.new_word);
    this.setState ({
      story: newStory
    });
  },
  toggleVisibility: function(e) {
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
    var words = this.props.story.match(match_words);
    if (this.state.visible) {
      var submit = "hide";
    }
    else {
      var submit = "show";
    }
    return (
      <div className="madlibs">
        <SetOfPrompts words={words} onChange={this.handleChange} />
        <button onClick={this.toggleVisibility}> {submit} </button>
        <MadStory story={this.state.story} visible={this.state.visible}  />
      </div>
      )
  }
});

React.render(<MadLibs story={sample_story} />, document.getElementById('madlibs'));
