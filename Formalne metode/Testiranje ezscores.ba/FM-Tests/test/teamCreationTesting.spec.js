import { Builder, Browser, By, Key, until } from 'selenium-webdriver';
import { expect } from 'chai';

async function  generateRandomName(length = 8) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let randomName = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomName += characters[randomIndex];
    }

    return randomName;
}

describe("Team creation test", function () {
    let driver;

      beforeEach(async function () {
        this.timeout(30000);
    
        console.log("Opening homepage...");
        driver = await new Builder().forBrowser(Browser.CHROME).build();
        await driver.get("https://ezscores.ba/HomePage");
        await driver.manage().window().maximize();
    
        console.log("Waiting for login link...");
        let loginLink = await driver.wait(until.elementLocated(By.xpath("//a[contains(text(),'Login')]")), 10000);
        console.log("Clicking login link...");
        await loginLink.click();
    
        console.log("Waiting for username field...");
        let usernameField = await driver.wait(until.elementLocated(By.id("KorisnickoIme")), 10000);
        await driver.wait(until.elementIsVisible(usernameField), 10000);
        console.log("Entering username...");
        await usernameField.clear();
        await usernameField.sendKeys("ensarcevra");
    
        console.log("Waiting for password field...");
        let passwordField = await driver.wait(until.elementLocated(By.id("Lozinka")), 10000);
        await driver.wait(until.elementIsVisible(passwordField), 10000);
        console.log("Entering password...");
        await passwordField.clear();
        await passwordField.sendKeys("Messi1");
    
        console.log("Clicking login button...");
        let loginButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(),'Prijavi se')]")), 10000);
        await driver.wait(until.elementIsVisible(loginButton), 10000);
        await loginButton.click();
    
        console.log("Verifying successful login...");
    });
    
  

    it("Test valid team creation", async function () {

        let myTeams = await driver.wait(until.elementLocated(By.xpath("//a[contains(text(),'Moje ekipe') and contains(@class, 'nav-button')]")), 10000);
        await driver.wait(until.elementIsVisible(myTeams), 10000);
        await myTeams.click();
        let createTeam = await driver.findElement(By.id("btnKreiraj"));
        await createTeam.click();

        let teamNameInput = await driver.wait(until.elementLocated(By.id("inputNaziv")), 10000);
        await driver.wait(until.elementIsVisible(teamNameInput), 10000);
        await teamNameInput.click();
        await teamNameInput.clear();
        let name = await generateRandomName();
        await teamNameInput.sendKeys(name);
        let addPlayerButton = await driver.wait(until.elementsLocated(By.id("dodaj")), 10000);

        for (let i = 0; i < addPlayerButton.length; i++) {
            let button = await addPlayerButton[i];
            await driver.wait(until.elementIsVisible(button), 10000);
            await driver.executeScript("arguments[0].scrollIntoView(true);", button);
            await driver.sleep(500);
            await button.click();
        }
        let finishTeamCreation = await driver.findElement(By.id("btnKreirajEkipu"));
        await finishTeamCreation.click();

        let mBox = await driver.wait(until.elementLocated(By.id("mbox")), 10000);
        await driver.wait(until.elementIsVisible(mBox), 10000);

        let mBoxText = await driver.wait(until.elementLocated(By.xpath("//div[@id='mbox' and contains(@class, 'active')]//h5")), 10000);
        await driver.wait(until.elementIsVisible(mBoxText), 10000);

        let text = await mBoxText.getText();

        let okButton = await driver.wait(until.elementLocated(By.css(".btn.btn-secondary")), 10000);
        await driver.wait(until.elementIsVisible(okButton), 10000);
        await okButton.click();
        await driver.sleep(500);
        await expect(text).to.equal("Uspješno ste kreirali ekipu.");
    });



    it("Test team creation with name that already exsists", async function () {

        let myTeams = await driver.wait(until.elementLocated(By.xpath("//a[contains(text(),'Moje ekipe') and contains(@class, 'nav-button')]")), 10000);
        await driver.wait(until.elementIsVisible(myTeams), 10000);
        await myTeams.click();

        let createTeam = await driver.findElement(By.id("btnKreiraj"));
        await createTeam.click();


        let teamNameInput = await driver.wait(until.elementLocated(By.id("inputNaziv")), 10000);
        await driver.wait(until.elementIsVisible(teamNameInput), 10000);
        await teamNameInput.click();
        await teamNameInput.clear();
        await teamNameInput.sendKeys("Moderna");


        let addPlayerButton = await driver.wait(until.elementsLocated(By.id("dodaj")), 10000);

        for (let i = 0; i < addPlayerButton.length; i++) {
            let button = addPlayerButton[i];
            await driver.wait(until.elementIsVisible(button), 10000);
            await driver.executeScript("arguments[0].scrollIntoView(true);", button);
            await driver.sleep(500);
            await button.click();
        }
        let finishTeamCreation = await driver.findElement(By.id("btnKreirajEkipu"));
        await finishTeamCreation.click();

        let mBox = await driver.wait(until.elementLocated(By.id("mbox")), 10000);
        await driver.wait(until.elementIsVisible(mBox), 10000);

        let mBoxText = await driver.wait(until.elementLocated(By.xpath("//div[@id='mbox' and contains(@class, 'active')]//h5")), 10000);
        await driver.wait(until.elementIsVisible(mBoxText), 10000);

        let text = await mBoxText.getText();

        let okButton = await driver.wait(until.elementLocated(By.css(".btn.btn-secondary")), 10000);
        await driver.wait(until.elementIsVisible(okButton), 10000);
        await okButton.click();
        expect(text).to.equal("Ekipa sa ovim nazivom već postoji.");
    });


    it("Test team creation with name that is too long", async function () {

        let myTeams = await driver.wait(until.elementLocated(By.xpath("//a[contains(text(),'Moje ekipe') and contains(@class, 'nav-button')]")), 10000);
        await driver.wait(until.elementIsVisible(myTeams), 10000);
        await myTeams.click();

        let createTeam = await driver.findElement(By.id("btnKreiraj"));
        await createTeam.click();


        let teamNameInput = await driver.wait(until.elementLocated(By.id("inputNaziv")), 10000);
        await driver.wait(until.elementIsVisible(teamNameInput), 10000);
        await teamNameInput.click();
        await teamNameInput.clear();
        let name = await generateRandomName(51);
        await teamNameInput.sendKeys(name);


        let addPlayerButton = await driver.wait(until.elementsLocated(By.id("dodaj")), 10000);

        for (let i = 0; i < addPlayerButton.length; i++) {
            let button = addPlayerButton[i];
            await driver.wait(until.elementIsVisible(button), 10000);
            await driver.executeScript("arguments[0].scrollIntoView(true);", button);
            await driver.sleep(500);
            await button.click();
        }
        let finishTeamCreation = await driver.findElement(By.id("btnKreirajEkipu"));
        await finishTeamCreation.click();

        let mBox = await driver.wait(until.elementLocated(By.id("mbox")), 10000);
        await driver.wait(until.elementIsVisible(mBox), 10000);

        let mBoxText = await driver.wait(until.elementLocated(By.xpath("//div[@id='mbox' and contains(@class, 'active')]//h5")), 10000);
        await driver.wait(until.elementIsVisible(mBoxText), 10000);

        let text = await mBoxText.getText();

        let okButton = await driver.wait(until.elementLocated(By.css(".btn.btn-secondary")), 10000);
        await driver.wait(until.elementIsVisible(okButton), 10000);
        await okButton.click();
        expect(text).to.equal("Naziv ekipe je predug.");
    });

    it("Test team creation with empty name", async function () {

        let myTeams = await driver.wait(until.elementLocated(By.xpath("//a[contains(text(),'Moje ekipe') and contains(@class, 'nav-button')]")), 10000);
        await driver.wait(until.elementIsVisible(myTeams), 10000);
        await myTeams.click();

        let createTeam = await driver.findElement(By.id("btnKreiraj"));
        await createTeam.click();

        let teamNameInput = await driver.wait(until.elementLocated(By.id("inputNaziv")), 10000);
        await driver.wait(until.elementIsVisible(teamNameInput), 10000);
        await teamNameInput.click();
        await teamNameInput.clear();
        await teamNameInput.sendKeys("");

        let addPlayerButton = await driver.wait(until.elementsLocated(By.id("dodaj")), 10000);

        for (let i = 0; i < addPlayerButton.length; i++) {
            let button = addPlayerButton[i];
            await driver.wait(until.elementIsVisible(button), 10000);
            await driver.executeScript("arguments[0].scrollIntoView(true);", button);
            await driver.sleep(500);
            await button.click();
        }

        let finishTeamCreation = await driver.findElement(By.id("btnKreirajEkipu"));
        await finishTeamCreation.click();

        await driver.sleep(500);

        let formValidationError = await driver.wait(until.elementsLocated(By.className("errorProvider")), 10000);
        await driver.wait(until.elementIsVisible(formValidationError[0]), 10000);

        let errorText = await formValidationError[0].getText();

        expect(errorText).to.equal("*Obavezno polje");
    });

    it("Test team creation with less than 5 players", async function () {

        let myTeams = await driver.wait(until.elementLocated(By.xpath("//a[contains(text(),'Moje ekipe') and contains(@class, 'nav-button')]")), 10000);
        await driver.wait(until.elementIsVisible(myTeams), 10000);
        await myTeams.click();

        let createTeam = await driver.findElement(By.id("btnKreiraj"));
        await createTeam.click();


        let teamNameInput = await driver.wait(until.elementLocated(By.id("inputNaziv")), 10000);
        await driver.wait(until.elementIsVisible(teamNameInput), 10000);
        await teamNameInput.click();
        await teamNameInput.clear();
        await teamNameInput.sendKeys("Deportivo");


        let addPlayerButton = await driver.wait(until.elementsLocated(By.id("dodaj")), 10000);

        for (let i = 0; i < addPlayerButton.length - 2; i++) {
            let button = addPlayerButton[i];
            await driver.wait(until.elementIsVisible(button), 10000);
            await driver.executeScript("arguments[0].scrollIntoView(true);", button);
            await driver.sleep(500);
            await button.click();
        }

        let finishTeamCreation = await driver.findElement(By.id("btnKreirajEkipu"));
        await finishTeamCreation.click();

        await driver.sleep(500);

        let formValidationError = await driver.wait(until.elementsLocated(By.id("errRoster")), 10000);
        await driver.wait(until.elementIsVisible(formValidationError[0]), 10000);

        let errorText = await formValidationError[0].getText();

        expect(errorText).to.equal("*Ekipa mora imati najmanje 5 igrača");
    });

    it("Test team creation, but add 2 of the same player", async function () {
        let myTeams = await driver.wait(until.elementLocated(By.xpath("//a[contains(text(),'Moje ekipe') and contains(@class, 'nav-button')]")), 10000);
        await driver.wait(until.elementIsVisible(myTeams), 10000);
        await myTeams.click();

        let createTeam = await driver.findElement(By.id("btnKreiraj"));
        await createTeam.click();


        let teamNameInput = await driver.wait(until.elementLocated(By.id("inputNaziv")), 10000);
        await driver.wait(until.elementIsVisible(teamNameInput), 10000);
        await teamNameInput.click();
        await teamNameInput.clear();
        await teamNameInput.sendKeys("Deportivo");


        let addPlayerButton = await driver.wait(until.elementsLocated(By.id("dodaj")), 10000);
        await driver.wait(until.elementIsVisible(addPlayerButton[0]), 10000);
        await driver.executeScript("arguments[0].scrollIntoView(true);", addPlayerButton[0]);
        await driver.sleep(500)
        await addPlayerButton[0].click();
        await driver.sleep(500);
        await addPlayerButton[0].click();
        await driver.sleep(500);

        let mBox = await driver.wait(until.elementLocated(By.id("mbox")), 10000);
        await driver.wait(until.elementIsVisible(mBox), 10000);

        let mBoxText = await driver.wait(until.elementLocated(By.xpath("//div[@id='mbox' and contains(@class, 'active')]//h5")), 10000);
        await driver.wait(until.elementIsVisible(mBoxText), 10000);

        let text = await mBoxText.getText();

        let okButton = await driver.wait(until.elementLocated(By.css(".btn.btn-secondary")), 10000);
        await driver.wait(until.elementIsVisible(okButton), 10000);
        await okButton.click();
        await expect(text).to.equal("Dodavanje igrača nije moguće jer ovaj igrač vec postoji u vašem rosteru!");
    });

    afterEach(async function () {
        await driver.quit();
    });

});