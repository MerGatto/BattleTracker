
window.onload = function () {
    var piemenu1 = new wheelnav('piemenu1');
    piemenu1.spreaderInTitle = icon.plus;
    piemenu1.spreaderOutTitle = icon.cross;
    piemenu1.wheelRadius = piemenu1.wheelRadius * 0.65;
    piemenu1.spreaderRadius = piemenu1.wheelRadius * 0.2;
    piemenu1.maxPercent = 0.5;
    piemenu1.selectedNavItemIndex = null;
    piemenu1.createWheel();

    var piemenu2 = new wheelnav('piemenu2', piemenu1.raphael);
    piemenu2.wheelRadius = piemenu2.wheelRadius * 1;
    piemenu2.maxPercent = 0.5;
    piemenu2.selectedNavItemIndex = null;
    piemenu2.createWheel();

    var piemenu3 = new wheelnav('piemenu3', piemenu2.raphael);
    piemenu3.wheelRadius = piemenu3.wheelRadius * 1.3;
    piemenu3.maxPercent = 0.5;
    piemenu3.selectedNavItemIndex = null;
    piemenu3.createWheel();

    var piemenu4 = new wheelnav('piemenu4', piemenu3.raphael);
    piemenu4.wheelRadius = piemenu4.wheelRadius * 1.55;
    piemenu4.maxPercent = 0.5;
    piemenu4.selectedNavItemIndex = null;
    piemenu4.createWheel();

    var piemenu5 = new wheelnav('piemenu5', piemenu4.raphael);
    piemenu5.wheelRadius = piemenu5.wheelRadius * 1.7;
    piemenu5.maxPercent = 0.5;
    piemenu5.selectedNavItemIndex = null;
    piemenu5.createWheel();
}