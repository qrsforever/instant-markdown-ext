'use strict';

var marked = require('marked');
var stripIndent = require('strip-indent');
var util = require('hexo-util');
var stripHTML = require('striptags');
var hljs = require('highlight.js');

var MarkedRenderer = marked.Renderer;

function Renderer() {
    MarkedRenderer.apply(this);
    // this._headingId = {};
}

require('util').inherits(Renderer, MarkedRenderer);

function highlightUtil(str, lang) {
    var wrap = true;
    if (lang) {
        var values = lang.split(':');
        if (values.length > 1) {
            lang = values[0];
            if (values[1] != '+')
                wrap = false;
        }
    }
    var data = hljs.highlightAuto(stripIndent(str), [lang]);

    if (!wrap) 
        return data.value;

    var lines = data.value.split('\n');
    var numbers = '';
    var content = '';
    var result = '';
    var line;

    for (var i = 0, len = lines.length; i < len; i++) {
        line = lines[i];
        numbers += '<span class="line">' + (i+1) + '</span><br>';
        content += line + '<br>';
    }
    result += '<table><tr>';
    result += '<td class="gutter">' + numbers + '</td>';
    result += '<td class="code">' + content + '</td>';
    result += '</tr></table>';

    return result;
}

// Support To-Do List
Renderer.prototype.listitem = function(text) {
    var result;

    if (/^\s*\[[x ]\]\s*/.test(text)) {
        text = text.replace(/^\s*\[ \]\s*/, '<input type="checkbox"></input> ').replace(/^\s*\[x\]\s*/, '<input type="checkbox" checked></input> ');
        result = '<li style="list-style: none">' + text + '</li>\n';
    } else {
        result = '<li>' + text + '</li>\n';
    }
    return result;
};

// Add id attribute to headings
Renderer.prototype.heading = function(text, level) {
    var transformOption = this.options.modifyAnchors;
    var id = anchorId(stripHTML(text), transformOption);
    // var headingId = this._headingId;

    // //Add a number after id if repeated
    // if (headingId[id]) {
    //     id += '-' + headingId[id]++;
    // } else {
    //     headingId[id] = 1;
    // }
    // // add headerlink
    return '<h' + level + ' id="' + id + '"><a href="#' + id + '" class="headerlink" title="' + stripHTML(text) + '"></a>' + text + '</h' + level + '>';
};

function anchorId(str, transformOption) {
    return util.slugize(str.trim(), {transform: transformOption});
}

// Support AutoLink option
Renderer.prototype.link = function(href, title, text) {
    var prot;

    if (this.options.sanitize) {
        try {
            prot = decodeURIComponent(unescape(href))
            .replace(/[^\w:]/g, '')
            .toLowerCase();
        } catch (e) {
            return '';
        }

        if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0 || prot.indexOf('data:') === 0) {
            return '';
        }
    }

    if (!this.options.autolink && href === text && title == null) {
        return href;
    }

    var out = '<a href="' + href + '"';

    if (title) {
        out += ' title="' + title + '"';
    }

    out += '>' + text + '</a>';
    return out;
};

marked.setOptions({
        renderer: new Renderer(),
        gfm: true,
        pedantic: false,
        sanitize: false,
        tables: true,
        breaks: true,
        smartLists: true,
        smartypants: true,
        modifyAnchors: 1,
        autolink: true,
        langPrefix: '',
        highlight: function(code, lang) {
            return highlightUtil(code, lang);
        }
});

module.exports = marked;
