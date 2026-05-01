package com.rinflow.tests;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.testng.Assert;
import org.testng.annotations.*;

public class LoginTest {

    WebDriver driver;

    @BeforeMethod
    public void setup() throws InterruptedException {
        WebDriverManager.chromedriver().setup();
        driver = new ChromeDriver();
        driver.manage().window().maximize();
        driver.get("http://localhost:5173/");
        Thread.sleep(2000);
    }

    @DataProvider(name = "loginData")
    public Object[][] getLoginData() {
        return new Object[][]{
            { "user@gmail.com", "wrongpassword", false, "correct email wrong password"  },
            { "notexist@gmail.com",  "1q2w@#",        false, "wrong email correct password"  },
            { "notexist@gmail.com",  "wrongpassword",  false, "both wrong"                   },
            { "user@gmail.com", "User@123",         true,  "valid applicant login"        },
            { "admin@gmail.com",     "Admin@12",         true,  "valid officer login"          },
        };
    }

    @Test(dataProvider = "loginData")
    public void loginTest(String email, String password,
                          boolean shouldSucceed, String caseLabel) throws InterruptedException {

        driver.get("http://localhost:5173/login");
        Thread.sleep(2000);

        driver.findElement(By.xpath("//input[@placeholder='you@example.com']")).sendKeys(email);
        Thread.sleep(500);
        driver.findElement(By.xpath("//input[@placeholder='••••••••']")).sendKeys(password);
        Thread.sleep(500);
        driver.findElement(By.xpath("//button[normalize-space()='Sign in']")).click();
        Thread.sleep(3000);

        String currentUrl = driver.getCurrentUrl();

        if (shouldSucceed) {
            Assert.assertTrue(currentUrl.contains("/dashboard"),
                    "Valid login should redirect to /dashboard | Case: " + caseLabel
                    + " | Actual URL: " + currentUrl);

            WebElement logoutBtn = driver.findElement(
                    By.xpath("//button[contains(normalize-space(),'Logout')]"));
            Assert.assertTrue(logoutBtn.isDisplayed(),
                    "Logout button should be visible after successful login | Case: " + caseLabel);

            WebElement welcome = driver.findElement(By.xpath("//*[contains(text(),'Welcome')]"));
            Assert.assertTrue(welcome.isDisplayed(),
                    "Welcome message should be displayed after login | Case: " + caseLabel);

        } else {
            Assert.assertFalse(currentUrl.contains("/dashboard"),
                    "Invalid login should NOT reach /dashboard | Case: " + caseLabel
                    + " | Actual URL: " + currentUrl);
        }

        System.out.println("PASSED | Case: " + caseLabel);
    }

    @Test
    public void logoutTest() throws InterruptedException {
        driver.get("http://localhost:5173/login");
        Thread.sleep(2000);

        driver.findElement(By.xpath("//input[@placeholder='you@example.com']")).sendKeys("user@gmail.com");
        driver.findElement(By.xpath("//input[@placeholder='••••••••']")).sendKeys("User@123");
        driver.findElement(By.xpath("//button[normalize-space()='Sign in']")).click();
        Thread.sleep(3000);

        Assert.assertTrue(driver.getCurrentUrl().contains("/dashboard"),
                "Should be on /dashboard before testing logout");

        driver.findElement(By.xpath("//button[contains(normalize-space(),'Logout')]")).click();
        Thread.sleep(2000);

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