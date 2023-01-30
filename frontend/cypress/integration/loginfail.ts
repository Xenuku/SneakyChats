describe('Testing for errors', () => {
    it('Should fail to login', () => {
        cy.visit('/')
        cy.contains('Sneak inside to begin chatting!')
        cy.get('input[name="username"]').type('NotARealUser');
        cy.get('input[name="password"]').type('nothanks');
        cy.wait(1000);
        cy.get('[class="submit-login"]').click();
        cy.contains('Wrong username or password')
    });

    it('Should fail to set username to Super', () => {
        cy.visit('/account', {
            onBeforeLoad: (window) => {
              window.localStorage.setItem("username", 'Test');
              window.localStorage.setItem("email", "test@test.com");
              window.localStorage.setItem("level", "user");
              window.localStorage.setItem("logged_in", "true");
            }
        });
        cy.get('input[name="username"]').clear();
        cy.get('input[name="username"]').type('Super');
        cy.get('button[type="submit"]').click()
        cy.contains("Sorry, this username is already in use");
    })
});

