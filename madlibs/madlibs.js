var sample_story = 
"JavaScript is built on some very { good, adjective } ideas and a few very " + 
"{ bad, adjective } ones. The very { good, adjective } ideas include " + 
"{ functions, plural noun }, { loose, adjective } typing, " +
"{ dynamic, adjective }  objects, and an expressive object literal " + 
"{ notation, noun }. The { bad, adjective } ideas include a programming " +
"model based on global { variables, plural noun }. JavaScript’s functions " +
"are first class  { objects, plural noun } with (mostly) " +
"{ lexical, adjective }  scoping. ";

// It would be awesome if I could NOT MATCH THE STUPID BRACKETS
var match_words = /(\{)(?:[^\}])*(\})/g;

// Gets rid of brackets and separates original word and type
var parse_match = /\{\s?(.+),\s?(.+)\s?\}/;

// This matches one bunch of regular words and one mad word at a time.
var match_slow = /([^\{]+)\{\s?([^,]+),\s?([^\}]+)\s?\}(.*$)/

// this returns an array of words and objects representing the story
var parse_story = function(story) {
    var text = [];
    var i = 0;
    var match = match_slow.exec(story);
    while (match != null) {
      var plain = match[1] ;
      var word = { num: i.toString(), original: match[2], current: match[2] };
      text.push( plain );
      text.push( word );
      story = match[4];
      match = match_slow.exec(story);
      i = i + 1;
    }
    text.push(story);
    return text;
}

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
    return;
  },
  render: function(){
    //WHYYYYYYY?!?!?!?!?
    var hello = this.handleChange;
    var id = 0;
    var prompts = this.props.words.map(function(tuple) {
      arr = parse_match.exec(tuple);
      var word = { id: id.toString(), original: arr[1], type: arr[2] };
      id = id + 1;
      return (
        <Prompt word={word} onChange={hello} />
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
    var text = this.props.text;
    text = text.map(function(x) {
      if ((typeof x) == "string") {
        return <span>{ x }</span>
      }
      else {
        return <MadWord word={x} />
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
      { text }
      </p>
    )
  }
});

var MadLibs = React.createClass({
  getInitialState: function(){
    return {
      text: parse_story(this.props.story),
      visible: false
    }
  },
  initialStory: function(story_text) {
    return parse_story(text);
  },
  changeStory: function(story_text, word_id, new_word) {
    var story = story_text;
    var text = story_text.map ( function (x) {
      if (x.num == word_id) {
        x.current = new_word;
      }
      return x;
    });
    return text;
  },
  handleChange: function(e) {
    var newText = this.changeStory(this.state.text, e.word_id, e.new_word);
    this.setState ({
      story: this.props.story,
      text: newText
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
        <MadStory text={this.state.text} visible={this.state.visible}  />
      </div>
      )
  }
});

React.render(<MadLibs story={sample_story} />, document.getElementById('madlibs'));
