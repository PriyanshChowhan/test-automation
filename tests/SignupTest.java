package com.rinflow.tests;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.testng.Assert;
import org.testng.annotations.*;

public class SignupTest {

    WebDriver driver;

    String uniqueEmail = "newuser" + System.currentTimeMillis() + "@test.com";
    String dupliEmail = uniqueEmail;

    @BeforeMethod
    public void setup() throws InterruptedException {
        WebDriverManager.chromedriver().setup();
        driver = new ChromeDriver();
        driver.manage().window().maximize();
        driver.get("http://localhost:5173/");
        Thread.sleep(2000);
    }

    @DataProvider(name = "signupData")
    public Object[][] getSignupData() {
        return new Object[][]{
            { "Test User One",  uniqueEmail,           "ValidPass@1", "ValidPass@1", "valid signup"       },
            { "Test User Two",  "user2@test.com",      "123",         "123",         "weak password"      },
            { "Test User Three","user3@test.com",      "nouppecase1@","nouppecase1@","no uppercase"       },
            { "Test User Four", "user4@test.com",      "ValidPass@1", "WrongConfirm","password mismatch"  },
            { "Test User Five", dupliEmail,            "ValidPass@1", "ValidPass@1", "duplicate email"    },
            { "Test User Six",  "user@gmail.com",      "User@123",    "User@123",    "valid user signup"  },
        };
    }

    @Test(dataProvider = "signupData")
    public void signupTest(String name, String email, String password,
                           String confirmPassword, String caseLabel) throws InterruptedException {

        navigateToSignup();

        fillForm(name, email, password, confirmPassword);

        WebElement createBtn = driver.findElement(By.xpath("//button[normalize-space()='Create Account']"));
        boolean isEnabled = createBtn.isEnabled();

        System.out.println("Case: [" + caseLabel + "] | Button enabled: " + isEnabled);

        // ✅ VALID SIGNUP CASES
        if (caseLabel.equals("valid signup") ||
            caseLabel.equals("valid user signup") ||
            caseLabel.equals("valid admin signup")) {

            Assert.assertTrue(isEnabled,
                    "Button should be ENABLED for valid input | Case: " + caseLabel);

            createBtn.click();
            Thread.sleep(3000);

            Assert.assertTrue(driver.getCurrentUrl().contains("/login"),
                    "Valid signup should redirect to /login | Actual URL: " + driver.getCurrentUrl());
        }

        // ✅ DUPLICATE EMAIL CASE (FIXED PROPERLY)
        else if (caseLabel.equals("duplicate email")) {

            // Step 1: First signup (create user)
            Assert.assertTrue(isEnabled, "Button should be enabled for first signup");

            createBtn.click();
            Thread.sleep(3000);

            // Step 2: Try signing up again with SAME email
            navigateToSignup();
            fillForm(name, email, password, confirmPassword);

            WebElement btn2 = driver.findElement(By.xpath("//button[normalize-space()='Create Account']"));
            Assert.assertTrue(btn2.isEnabled(), "Button should still be enabled");

            btn2.click();
            Thread.sleep(3000);

            // Step 3: Should NOT redirect
            Assert.assertFalse(driver.getCurrentUrl().contains("/login"),
                    "Duplicate email should NOT redirect to /login | Actual URL: " + driver.getCurrentUrl());
        }

        // ❌ INVALID INPUT CASES
        else {
            Assert.assertFalse(isEnabled,
                    "Button should be DISABLED for invalid input | Case: " + caseLabel);

            boolean errorShown = !driver.findElements(
                    By.xpath("//div[contains(@class,'bg-pink-50')]")).isEmpty();

            Assert.assertTrue(errorShown,
                    "Validation error should be visible | Case: " + caseLabel);
        }

        System.out.println("PASSED | Case: " + caseLabel);
    }

    // 🔧 Helper: Navigate to signup
    private void navigateToSignup() throws InterruptedException {
        try {
            driver.findElement(By.xpath("//button[normalize-space()='Get Started']")).click();
            Thread.sleep(2000);
        } catch (Exception e) {
            driver.get("http://localhost:5173/signup");
            Thread.sleep(2000);
        }
    }

    // 🔧 Helper: Fill form
    private void fillForm(String name, String email, String password, String confirmPassword) throws InterruptedException {
        driver.findElement(By.xpath("//input[@placeholder='Enter your full name']")).sendKeys(name);
        Thread.sleep(500);
        driver.findElement(By.xpath("//input[@placeholder='you@example.com']")).sendKeys(email);
        Thread.sleep(500);
        driver.findElement(By.xpath("(//input[@placeholder='••••••••'])[1]")).sendKeys(password);
        Thread.sleep(1000);
        driver.findElement(By.xpath("(//input[@placeholder='••••••••'])[2]")).sendKeys(confirmPassword);
        Thread.sleep(1000);
    }

    @AfterMethod
    public void tearDown() {
        driver.quit();
    }
}