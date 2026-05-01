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

public class LoginTest {

    WebDriver driver;
    WebDriverWait wait;

    @BeforeMethod
    public void setup() {
        WebDriverManager.chromedriver().setup();
        driver = new ChromeDriver();
        driver.manage().window().maximize();
        // Single shared wait; all tests use 15-second explicit waits instead of Thread.sleep
        wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        driver.get("http://localhost:5173/");
        // driver.get() already blocks until browser readyState == "complete"; no sleep needed
    }

    @DataProvider(name = "loginData")
    public Object[][] getLoginData() {
        return new Object[][]{
            { "user@gmail.com",     "wrongpassword", false, "correct email wrong password" },
            { "notexist@gmail.com", "1q2w@#",        false, "wrong email correct password" },
            { "notexist@gmail.com", "wrongpassword",  false, "both wrong"                  },
            { "user@gmail.com",     "User@123",       true,  "valid applicant login"       },
            { "admin@gmail.com",    "Admin@12",       true,  "valid officer login"         },
        };
    }

    @Test(dataProvider = "loginData")
    public void loginTest(String email, String password,
                          boolean shouldSucceed, String caseLabel) {

        driver.get("http://localhost:5173/login");

        // Wait for the login form to be fully rendered before interacting
        wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//input[@placeholder='you@example.com']"))).sendKeys(email);

        wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//input[@placeholder='••••••••']"))).sendKeys(password);

        wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[normalize-space()='Sign in']"))).click();

        if (shouldSucceed) {
            // Wait for the actual navigation rather than sleeping a fixed duration
            wait.until(ExpectedConditions.urlContains("/dashboard"));

            String currentUrl = driver.getCurrentUrl();
            Assert.assertTrue(currentUrl.contains("/dashboard"),
                    "Valid login should redirect to /dashboard | Case: " + caseLabel
                            + " | Actual URL: " + currentUrl);

            // Wait for dashboard content — these elements only render after React sets user state
            WebElement logoutBtn = wait.until(ExpectedConditions.visibilityOfElementLocated(
                    By.xpath("//button[contains(normalize-space(),'Logout')]")));
            Assert.assertTrue(logoutBtn.isDisplayed(),
                    "Logout button should be visible after successful login | Case: " + caseLabel);

            WebElement welcome = wait.until(ExpectedConditions.visibilityOfElementLocated(
                    By.xpath("//*[contains(text(),'Welcome')]")));
            Assert.assertTrue(welcome.isDisplayed(),
                    "Welcome message should be displayed after login | Case: " + caseLabel);

        } else {
            // For a failed login the backend returns an error; React shows "Error submitting
            // application." in the message div. Wait for that signal (or timeout) before
            // asserting the URL — avoids a fixed 3-second blind sleep that is too short on
            // slow machines and wastes time on fast ones.
            try {
                wait.until(ExpectedConditions.or(
                        ExpectedConditions.urlContains("/dashboard"),
                        ExpectedConditions.visibilityOfElementLocated(
                                By.xpath("//*[contains(text(),'Error')]"))
                ));
            } catch (Exception ignored) {
                // A timeout here is also acceptable — the page simply stayed put
            }

            String currentUrl = driver.getCurrentUrl();
            Assert.assertFalse(currentUrl.contains("/dashboard"),
                    "Invalid login should NOT reach /dashboard | Case: " + caseLabel
                            + " | Actual URL: " + currentUrl);
        }

        System.out.println("PASSED | Case: " + caseLabel);
    }

    @Test
    public void logoutTest() {
        driver.get("http://localhost:5173/login");

        // Wait for form before interacting
        wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//input[@placeholder='you@example.com']"))).sendKeys("user@gmail.com");

        wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//input[@placeholder='••••••••']"))).sendKeys("User@123");

        wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[normalize-space()='Sign in']"))).click();

        // Wait for actual dashboard URL instead of sleeping 3 s
        wait.until(ExpectedConditions.urlContains("/dashboard"));
        Assert.assertTrue(driver.getCurrentUrl().contains("/dashboard"),
                "Should be on /dashboard before testing logout");

        // Wait for the Logout button to be clickable (dashboard content fully rendered)
        wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(normalize-space(),'Logout')]"))).click();

        // Wait for navigation away from dashboard instead of sleeping 2 s
        wait.until(ExpectedConditions.not(
                ExpectedConditions.urlContains("/dashboard")));

        String urlAfterLogout = driver.getCurrentUrl();
        Assert.assertFalse(urlAfterLogout.contains("/dashboard"),
                "After logout should NOT be on /dashboard | Actual URL: " + urlAfterLogout);

        System.out.println("PASSED | logoutTest | URL after logout: " + urlAfterLogout);
    }

    @AfterMethod
    public void tearDown() {
        driver.quit();
    }
}