// Due to how easy this syntax is to read and the 'it()' descriptions,
// I believe this test speaks for itself

describe('Test Sneaky Chat', () => {
  it('Visit the login page, confirm it exists, login as Super', () => {
    cy.visit('/')
    cy.contains('Sneak inside to begin chatting!')
    cy.get('input[name="username"]').type('Super');
    cy.get('input[name="password"]').type('test1234');
    cy.wait(2000);
    cy.get('[class="submit-login"]').click();
 });
  it('Should send a chat message after login', () => {
    cy.wait(2000);
    cy.contains('Room: Main')
    cy.contains('You have joined Sneaky Chat!')
    cy.get('input[name="message"]').type("Test message by cypress!");
    cy.get('[id="send-message"]').click();
    cy.contains('Test message by cypress!');
    cy.wait(1000)
  });

  it('Should confirm the account page exists', () => {
    cy.visit('/account', {
      onBeforeLoad: (window) => {
        window.localStorage.setItem("username", 'Super');
        window.localStorage.setItem("email", "someone@someplace.com");
        window.localStorage.setItem("level", "superadmin");
        window.localStorage.setItem("room", "Global_Main");
        window.localStorage.setItem("logged_in", "true");
      }
    });
    cy.contains('Hello, Super')
  });
  it('Should confirm admin page access', () => {
    cy.visit('/manage', {
      onBeforeLoad: (window) => {
        window.localStorage.setItem("username", 'Super');
        window.localStorage.setItem("email", "someone@someplace.com");
        window.localStorage.setItem("level", "superadmin");
        window.localStorage.setItem("room", "Global_Main");
        window.localStorage.setItem("logged_in", "true");
      }
    });
    cy.contains("Welcome to Sneaky Chat Management")
  });
  it('Should log out', () => {
    cy.get('a').contains('Logout').click();
    cy.contains("Sneak inside to begin chatting!");
  })
});

