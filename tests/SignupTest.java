package com.rinflow.tests;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.*;

import java.time.Duration;

public class SignupTest {

    WebDriver driver;
    WebDriverWait wait;

    // Both fields are generated once per class instance (TestNG reuses the same instance
    // across DataProvider invocations), so "valid signup" registers uniqueEmail first and
    // "duplicate email" re-uses the same address — intentional by design.
    String uniqueEmail = "newuser" + System.currentTimeMillis() + "@test.com";
    String dupliEmail  = uniqueEmail;

    @BeforeMethod
    public void setup() {
        WebDriverManager.chromedriver().setup();
        driver = new ChromeDriver();
        driver.manage().window().maximize();
        wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        driver.get("http://localhost:5173/");
    }

    @DataProvider(name = "signupData")
    public Object[][] getSignupData() {
        return new Object[][]{
            { "Test User One",   uniqueEmail,       "ValidPass@1",  "ValidPass@1",  "valid signup"      },
            { "Test User Two",   "user2@test.com",  "123",          "123",          "weak password"     },
            { "Test User Three", "user3@test.com",  "nouppecase1@", "nouppecase1@", "no uppercase"      },
            { "Test User Four",  "user4@test.com",  "ValidPass@1",  "WrongConfirm", "password mismatch" },
            { "Test User Five",  dupliEmail,        "ValidPass@1",  "ValidPass@1",  "duplicate email"   },
            { "Test User Six",   "user@gmail.com",  "User@123",     "User@123",     "valid user signup" },
        };
    }

    @Test(dataProvider = "signupData")
    public void signupTest(String name, String email, String password,
                           String confirmPassword, String caseLabel) throws InterruptedException {

        navigateToSignup();
        fillForm(name, email, password, confirmPassword);

        // ✅ VALID SIGNUP CASES
        if (caseLabel.equals("valid signup") ||
            caseLabel.equals("valid user signup") ||
            caseLabel.equals("valid admin signup")) {

            // Wait for React to enable the button (validation has passed) instead of
            // grabbing it immediately — avoids the race between sendKeys and useEffect
            WebElement createBtn = wait.until(d -> {
                WebElement btn = d.findElement(
                        By.xpath("//button[normalize-space()='Create Account']"));
                return btn.isEnabled() ? btn : null;
            });

            boolean isEnabled = createBtn.isEnabled();
            System.out.println("Case: [" + caseLabel + "] | Button enabled: " + isEnabled);

            Assert.assertTrue(isEnabled,
                    "Button should be ENABLED for valid input | Case: " + caseLabel);

            createBtn.click();

            // Wait for actual redirect to /login instead of sleeping 3 s
            wait.until(ExpectedConditions.urlContains("/login"));

            Assert.assertTrue(driver.getCurrentUrl().contains("/login"),
                    "Valid signup should redirect to /login | Actual URL: " + driver.getCurrentUrl());
        }

        // ✅ DUPLICATE EMAIL CASE
        else if (caseLabel.equals("duplicate email")) {

            // First attempt — button must be enabled (no validation errors on form itself)
            WebElement createBtn = wait.until(ExpectedConditions.elementToBeClickable(
                    By.xpath("//button[normalize-space()='Create Account']")));
            Assert.assertTrue(createBtn.isEnabled(),
                    "Button should be enabled for first signup");

            createBtn.click();

            // Wait for the server to respond: either a redirect to /login (if this email was
            // not yet taken) or an error message from the backend (409 - email exists).
            try {
                wait.until(ExpectedConditions.or(
                        ExpectedConditions.urlContains("/login"),
                        ExpectedConditions.visibilityOfElementLocated(
                                By.xpath("//*[contains(text(),'Error') or contains(text(),'exists')]"))
                ));
            } catch (Exception ignored) {
                // Timeout also acceptable — page simply stayed on signup
            }

            // Step 2: second signup attempt with the same email
            navigateToSignup();
            fillForm(name, email, password, confirmPassword);

            WebElement btn2 = wait.until(ExpectedConditions.elementToBeClickable(
                    By.xpath("//button[normalize-space()='Create Account']")));
            Assert.assertTrue(btn2.isEnabled(), "Button should still be enabled");

            btn2.click();

            // Wait for server response to the second attempt
            try {
                wait.until(ExpectedConditions.or(
                        ExpectedConditions.urlContains("/login"),
                        ExpectedConditions.visibilityOfElementLocated(
                                By.xpath("//*[contains(text(),'Error') or contains(text(),'exists')]"))
                ));
            } catch (Exception ignored) {
                // Timeout acceptable
            }

            // The second attempt must NOT redirect — email is already taken
            Assert.assertFalse(driver.getCurrentUrl().contains("/login"),
                    "Duplicate email should NOT redirect to /login | Actual URL: " + driver.getCurrentUrl());
        }

        // ❌ INVALID INPUT CASES (button must be disabled, error must be shown)
        else {
            // Wait for React's useEffect to run and disable the button — the
            // original code read button state immediately after sendKeys, which
            // creates a race between Selenium and React's re-render cycle.
            wait.until(d -> {
                WebElement btn = d.findElement(
                        By.xpath("//button[normalize-space()='Create Account']"));
                return !btn.isEnabled() ? btn : null;
            });

            WebElement createBtn = driver.findElement(
                    By.xpath("//button[normalize-space()='Create Account']"));
            boolean isEnabled = createBtn.isEnabled();

            System.out.println("Case: [" + caseLabel + "] | Button enabled: " + isEnabled);

            Assert.assertFalse(isEnabled,
                    "Button should be DISABLED for invalid input | Case: " + caseLabel);

            // Wait for the pink validation error div to appear before asserting it
            wait.until(ExpectedConditions.presenceOfElementLocated(
                    By.xpath("//div[contains(@class,'bg-pink-50')]")));

            boolean errorShown = !driver.findElements(
                    By.xpath("//div[contains(@class,'bg-pink-50')]")).isEmpty();

            Assert.assertTrue(errorShown,
                    "Validation error should be visible | Case: " + caseLabel);
        }

        System.out.println("PASSED | Case: " + caseLabel);
    }

    // 🔧 Helper: Navigate to signup page
    private void navigateToSignup() {
        // Use a short wait for the landing-page "Get Started" button; fall back to direct URL
        // if the 3D Spline scene is still loading and the button isn't ready yet.
        try {
            WebDriverWait shortWait = new WebDriverWait(driver, Duration.ofSeconds(5));
            shortWait.until(ExpectedConditions.elementToBeClickable(
                    By.xpath("//button[normalize-space()='Get Started']"))).click();
        } catch (Exception e) {
            driver.get("http://localhost:5173/signup");
        }
        // Confirm the form is actually visible before returning — replaces Thread.sleep(2000)
        wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//input[@placeholder='Enter your full name']")));
    }

    // 🔧 Helper: Fill the signup form
    private void fillForm(String name, String email,
                          String password, String confirmPassword) throws InterruptedException {

        wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//input[@placeholder='Enter your full name']"))).sendKeys(name);

        wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//input[@placeholder='you@example.com']"))).sendKeys(email);

        wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("(//input[@placeholder='••••••••'])[1]"))).sendKeys(password);

        // Brief pause so React's useEffect for password validation can fire and update state
        // before we fill confirmPassword (avoids transient "button enabled" window)
        Thread.sleep(400);

        wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("(//input[@placeholder='••••••••'])[2]"))).sendKeys(confirmPassword);

        // Allow React's confirmPassword useEffect to run before the caller reads button state
        Thread.sleep(400);
    }

    @AfterMethod
    public void tearDown() {
        driver.quit();
    }
}