var numColors = 4;
var width=100;
var height=100;
var numFrames = 10;

function RLE_decode(encoded) {
    var output = "";
    for (var i = 0; i < encoded.length; i += 2) {
      output += new Array(1+encoded[i]).join(encoded[i+1])
    }
    return output;
}

var getCanvasses = function (rleCanvasses) {
  var out = [];
  for (var i = 0; i < rleCanvasses.length; i++) {
    out[i] = RLE_decode(rleCanvasses[i]);
  }
  return out;
}


function countColorUsage(canvas) {
  colorUsageCount=[];
  for (var countIndex=0; countIndex<numColors; ++countIndex) {
    colorUsageCount[countIndex]=0;
  }
  for (var j=0;j<height;j++){
    for (var i=0;i<width;i++){
      var sample = canvas[i+j*width];
      ++colorUsageCount[sample];
    }
  }
  return colorUsageCount;
}

function downsample(canvas, compareBlockCount, downsampledResult) {
  var widthInPixels = width/compareBlockCount;
  var heightInPixels = height/compareBlockCount;

  var colorUsageCount=[];
  for (var j=0;j<compareBlockCount;j++){
    for (var i=0;i<compareBlockCount;i++){
      for (var countIndex=0; countIndex<numColors; ++countIndex) {
        colorUsageCount[countIndex]=0;
      }
      for (var subj=0;subj<heightInPixels;subj++){
        for (var subi=0;subi<widthInPixels;subi++){
          var sample = canvas[i*widthInPixels+subi+width*(j*heightInPixels+subj)];
          ++colorUsageCount[sample];
        }
      }
      var majorityColorIndex=0;
      for (var countIndex=0; countIndex<numColors; ++countIndex) {
        if (colorUsageCount[countIndex] > colorUsageCount[majorityColorIndex]) {
          majorityColorIndex = countIndex;
        }
      }
      downsampledResult[i+j*widthInPixels]=majorityColorIndex;      
    }
  }
}

function compareCanvasses(canvasA, canvasB) {
  var similarity=0;
  var compareBlockCount=10;
  var compareCanvasA = new Uint8Array(compareBlockCount*compareBlockCount);
  var compareCanvasB = new Uint8Array(compareBlockCount*compareBlockCount);
  downsample(canvasA, compareBlockCount, compareCanvasA);
  downsample(canvasB, compareBlockCount, compareCanvasB);
  for (var i=0; i<compareCanvasA.length; ++i) {
    if (compareCanvasA[i] == compareCanvasB[i])
      ++similarity;
  }
  similarity /= compareBlockCount*compareBlockCount;
  return similarity;
}

module.exports = {
  update: function (game, verbose) {
      var frameData = game.frameData;
      var canvasses = getCanvasses(game.canvasses);
      var initialColor = game.initialColor;
      var hyperlinks = game.hyperlinks;

      var complianceScore = 0.0;
      var frameInQuestion=0;

      function log(text) {
        if (verbose) {
          console.log(text);
        }
      }

      if (frameData === undefined) {
        
        if (game.legacyCompliance !== undefined) {
          log("legacy compliance data - " + game.legacyCompliance);
          return game.legacyCompliance;
        } else {
          console.log("this game has no compliance data");
          return 0;
        }
        
      }
      log("compliance report");
      // NOTE: frame 1
      {
        if (frameData[frameInQuestion].strokesCount==1) {
          complianceScore+=0.5;
          log("1 - single stroke - yes");
        } else {
          // zero points
          log("1 - single stroke - no");
        }
        if (frameData[frameInQuestion].initialStrokeColor==initialColor) {
          complianceScore+=0.5;
          log("1: first stroke color - yes");
        } else {
          // zero points
          log("1: first stroke color - no");
        }
      }
      ++frameInQuestion;
      // NOTE: frame 2
      if (frameData[frameInQuestion].strokesCount%2==0) {
        complianceScore+=1.0;
        log("2: even strokes - yes");
      } else {
        // zero points
        log("2: even strokes - no");
      }
      ++frameInQuestion;
      // NOTE: frame 3
      {
        var colorUsage=countColorUsage(canvasses[frameInQuestion]);
        var usedColors=0;
        for (var i=0; i<colorUsage.length; ++i) {
          if (colorUsage[i] > 0) {
            ++usedColors;
          }
        }
        if (usedColors==3) {
          log("3: used 3 colors - yes");
          complianceScore+=1.0;
        } else {
          log("3: used 3 colors - no");
          // zero points
        }
      }
      ++frameInQuestion;
      // NOTE: frame 4
      {
        var linkUsage=[];
        for (var linkUsageIndex=0; linkUsageIndex<=numFrames; ++linkUsageIndex) {
          linkUsage[linkUsageIndex]=0;
        }
        for (var linkIndex=0; linkIndex<numColors; ++linkIndex) {
          var linksTo=hyperlinks[frameInQuestion][linkIndex];
          ++linkUsage[linksTo];
        }
        var usedLinks=0;
        for (var linkIndex=1; linkIndex<=numFrames; ++linkIndex) {
          if (linkUsage[linkIndex]>0) {
            ++usedLinks;
          }
        }
        if (usedLinks==4) {
          log("4: used 4 links - yes");
          complianceScore+=1.0;
        } else {
          log("4: used 4 links - no");
          // zero points
        }
      }
      ++frameInQuestion;
      // NOTE: frame 5
      {
        // left handed drawing is unscored
      }
      ++frameInQuestion;
      // NOTE: frame 6
      var similarity=compareCanvasses(canvasses[2], canvasses[5]);
      complianceScore+=similarity;
      log("5: similarity " + similarity);
      ++frameInQuestion;
      // NOTE: frame 7
      
      if (frameData[frameInQuestion].strokesCount==0 &&
          frameData[frameInQuestion].fillsCount==0) {
        log("7: was left blank - yes");
        complianceScore+=1.0;
      } else {
        log("7: was left blank - no");
      }
      ++frameInQuestion;
      // NOTE: frame 8
      {
        // contemplation of the natural world is unscored
      }
      ++frameInQuestion;
      // NOTE: frame 9
      {
        var strokeCountOnFrame=frameData[frameInQuestion].strokesCount;
        var score=strokeCountOnFrame/3.0;
        score=Math.min(1.0, Math.max(0.0, score));

        if (score > 0) {
          log("9: drawn - yes");
        } else {
          log("9: drawn - no");
        }

        for (var frameIndex=0; frameIndex<numFrames; ++frameIndex) {
          if (frameIndex!=frameInQuestion) {
            for (var linkIndex=0; linkIndex<numColors; ++linkIndex) {
              var linksTo=hyperlinks[frameIndex][linkIndex];
              if (linksTo==1+frameInQuestion) {
                score-=1.0;
                log("9: has inappropriate links");
                break;
              }
            }
          }
        }

        score=Math.min(1.0, Math.max(0.0, score));
        complianceScore+=score;
      }
      ++frameInQuestion;
      // NOTE: frame 10
      {
        var score=0.5;
        for (var linkIndex=0; linkIndex<numColors; ++linkIndex) {
          if (hyperlinks[9][linkIndex]) {
            score = 0;
          };
        }
        if (score > 0) {
          log("10: ends with no links - yes");
        } else {
          log("10: ends with no links - no");
        }
        complianceScore += score;

        //did they draw something (maybe a circle)
        if (frameData[frameInQuestion].strokesCount > 0) {
          complianceScore += 0.5;
          log("10: final frame has a drawing - yes");
        } 
        else 
        {
          log("10: final frame has a drawing - no ");
        }
      }
      log("compliance score is " + complianceScore);
      log('vs legacy score ' + game.compliance);
      log("########################");
      return complianceScore;
    }
  }