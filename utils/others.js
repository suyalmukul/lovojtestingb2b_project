const chalk = require('chalk');
const QRCode = require('qrcode');

const colorizeText = (text, color) => {
  if (chalk[color]) {
    return chalk[color](text);
  } else {
    console.warn(`Color '${color}' is not supported by chalk.`);
    return text;
  }
}

const calculateRemainingfabric = (fabric, remainingLength) => {
  if (fabric) {
    const { rollInfo } = fabric;
    const selectedRolls = [];

    while (remainingLength > 0) {
        const availableRolls = rollInfo.filter(roll => roll.rollLength >= remainingLength);

        if (availableRolls.length > 0) {
            const smallestRoll = availableRolls.reduce((min, roll) => (roll.rollLength < min.rollLength ? roll : min), availableRolls[0]);
            remainingLength -= smallestRoll.rollLength;
            selectedRolls.push(smallestRoll);
        } else {
            const combinations = [];

            for (let i = 0; i < rollInfo.length; i++) {
                for (let j = i + 1; j < rollInfo.length; j++) {
                    const totalLength = rollInfo[i].rollLength + rollInfo[j].rollLength;
                    if (totalLength >= remainingLength) {
                        combinations.push({ rolls: [rollInfo[i], rollInfo[j]], totalLength });
                    }
                }
            }

            if (combinations.length > 0) {
                const selectedCombination = combinations.reduce((min, combination) => (combination.totalLength < min.totalLength ? combination : min), combinations[0]);
                remainingLength -= selectedCombination.totalLength;
                selectedRolls.push(...selectedCombination.rolls);
            } else {
                break;
            }
        }
    }
    selectedRolls.sort((a, b) => b.rollLength - a.rollLength);
    let length = 50
    for (let i = 0; i < selectedRolls.length; i++) {
        length -= selectedRolls[i].rollLength
        if (remainingLength <= 0) {
            let remain = -remainingLength * 2 + remainingLength
            console.log(remain)
        }
    }

    console.log(selectedRolls);

    return selectedRolls;
}


}

const globalResponse = (req, res, next) => {
  const originalJson = res.json;
  res.json = function (data) {
    if(res.statusCode < 300) {
      console.log(`Response Message : ${colorizeText(data?.message, "green")}`);
    } else {
      console.log(`Error Message : ${colorizeText(data?.message, "red")}`);
    }
    originalJson.call(this, data);
  };
  next();
};

const generateQRCode = async (text) => {
  return new Promise((resolve, reject) => {
    QRCode.toDataURL(text, (err, url) => {
      if (err) {
        reject(err);
      } else {
        resolve(url);
      }
    });
  });
};

module.exports = {
  colorizeText,
  globalResponse,
  calculateRemainingfabric,
  generateQRCode
};
