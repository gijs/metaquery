(function ( window, document ) {
  var metaQuery = {
    breakpoints: {},
    _events: {},
    _eventMatchCache: {},
    bind: function ( name, fn ) {
      ( metaQuery._events[name] = [] ).push( fn );
      
      mqChange();
    }
  },
  
  // Pinched domready
  // http://www.dustindiaz.com/smallest-domready-ever/
  readyState = function ( fn ) {
    if( /in/.test( document.readyState ) ) {
      window.setTimeout( function () {
       readyState( fn );
      }, 9 );
    } else {
      fn();
    }
  },
  
  addEvent = function ( element, event, fn ) {
    if ( document.addEventListener ) {
      element.addEventListener( event, fn );
    } else {
      element.attachEvent( 'on' + event, fn );
    }
  },
  
  // Pinched debounce.
  // https://github.com/bestiejs/lodash/blob/v0.4.2/lodash.js#L2178
  debounce = function( func, wait, immediate ) {
    var args,
        result,
        thisArg,
        timeoutId;

    function delayed() {
      timeoutId = null;
      if ( !immediate ) {
        func.apply( thisArg, args );
      }
    }
    
    return function() {
      var isImmediate = immediate && !timeoutId;
      args = arguments;
      thisArg = this;

      window.clearTimeout( timeoutId );
      timeoutId = window.setTimeout( delayed, wait );

      if ( isImmediate ) {
        result = func.apply( thisArg, args );
      }
      return result;
    };
  },
  
  addClass = function ( element, className ) {
    var classes = className.split(' ');
    for( var i = 0; i < classes.length; i++ ) {
      if( !hasClass( element, classes[i] ) ) {
        element.className = element.className !== '' ? ( element.className + ' ' + classes[i] ) : classes[i];
      }
    }
  },
  
  removeClass = function ( element, className ) {
    var classes = className.split(' ');
    for( var i = 0; i < classes.length; i++ ) {
      element.className = element.className.replace( new RegExp( '\\b' + classes[i] + '\\b( )?', 'g' ), '' );
    }
  },
  
  hasClass = function ( element, className ) {
    return new RegExp( '(^| )' + className + '( |$)', 'g' ).test( element.className );
  },
  
  updateClasses = function ( mq, name ) {
    var breakpoint = 'breakpoint-' + name,
        htmlNode = document.documentElement;
        
    if( mq.matches ) {
      addClass( htmlNode, breakpoint );
    } else {
      removeClass( htmlNode, breakpoint );
    }
  },
  
  updateElements = function ( mq, name ) {
    if( !mq.matches ) { return; }

    var elements = document.getElementsByTagName( 'img' );
    
    for( var i = 0; i < elements.length; i++ ) {
      var el = elements[i];
      
      for( var j = 0; j < el.attributes.length; j++ ) {
        var attribute = el.attributes[j],
            rattr = attribute.name.match( /^data\-mq\-(.*)/ );

        if( rattr ) { el.setAttribute( rattr[1], attribute.value.replace( '[breakpoint]', name ) ); }
      }
    }
  },
  
  // Called when a media query changes state
  mqChange = function () {
    for( var name in metaQuery.breakpoints ) {
      var query = metaQuery.breakpoints[name],
          mq = window.matchMedia( query );
      
      // Call events bound to a given breakpoint
      if( metaQuery._events[name] && metaQuery._eventMatchCache[name] !== mq.matches ) {
        for( var i = 0; i < metaQuery._events[name].length; i++ ) {
          var fn = metaQuery._events[name][i];
          metaQuery._eventMatchCache[name] = mq.matches;
          
          if( typeof fn === 'function' ) { fn( mq.matches ); }
        }
      }
      
      updateClasses( mq, name );
      updateElements( mq, name );
    }
  },
  
  collectMediaQueries = function () {
    var meta = document.getElementsByTagName( 'meta' );
    
    // Add classes to the HTML node when a breakpoint matches
    for( var i = 0; i < meta.length; i++ ) {
      if( meta[i].name === 'breakpoint' ) {
        var name = meta[i].getAttribute( 'data' ),
            query = meta[i].getAttribute( 'media' );

        metaQuery.breakpoints[name] = query;
      }
    }
  },
  
  init = function () {
    collectMediaQueries();
    
    addEvent( window, 'resize', debounce( function () {
      mqChange();
    }, 50 ));
    
    mqChange();
  };
  
  window.metaQuery = metaQuery;
  
  // DOM ready
  readyState( init );
}( this, this.document ));