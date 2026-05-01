package com.rinflow.tests;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.*;

import java.time.Duration;

public class LoanApplicationTest {

    WebDriver driver;
    WebDriverWait wait;

    private void loginAsApplicant() throws InterruptedException {
        driver.get("http://localhost:5173/login");

        WebElement email = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//input[@placeholder='you@example.com']")));
        email.sendKeys("user@gmail.com");

        Thread.sleep(500); // 👈 just for visibility

        driver.findElement(By.xpath("//input[@placeholder='••••••••']"))
                .sendKeys("User@123");

        Thread.sleep(500); // 👈 just for visibility

        driver.findElement(By.xpath("//button[normalize-space()='Sign in']")).click();

        wait.until(ExpectedConditions.urlContains("/dashboard"));
        Thread.sleep(1500); // 👈 see dashboard load
    }

    @BeforeMethod
    public void setup() {
        WebDriverManager.chromedriver().setup();
        driver = new ChromeDriver();
        driver.manage().window().maximize();

        wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        driver.get("http://localhost:5173/");
    }

    @DataProvider(name = "loanApplicationData")
    public Object[][] getLoanApplicationData() {
        return new Object[][]{
            {
                "Priyansh Chowhan", "2", "Graduate", "true",
                "1500000", "500000", "5", "700",
                "5000000", "1000000", "1000000", "200000", "0",
                "single valid case"
            }
        };
    }

    @Test(dataProvider = "loanApplicationData")
    public void applyLoanTest(String name, String dependents, String education,
                             String selfEmployed, String income, String loanAmount,
                             String loanTerm, String cibilScore, String resiAsset,
                             String commAsset, String luxAsset, String bankAsset,
                             String debt, String caseLabel) throws InterruptedException {

        loginAsApplicant();

        // Click Apply button
        WebElement applyBtn = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(text(),'Apply for New Loan')]")));

        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView(true);", applyBtn);
        applyBtn.click();

        Thread.sleep(1500); // 👈 see navigation happen

        // Wait for form page
        wait.until(ExpectedConditions.or(
                ExpectedConditions.urlContains("/applicationform"),
                ExpectedConditions.visibilityOfElementLocated(By.xpath("//input[@placeholder='John Doe']"))
        ));

        Thread.sleep(1000); // 👈 see form fully loaded

        String currentUrl = driver.getCurrentUrl();
        System.out.println("DEBUG URL: " + currentUrl);

        Assert.assertTrue(currentUrl.contains("application"),
                "Should navigate to application form | URL: " + currentUrl);

        // Fill form (with small pauses for visibility)
        driver.findElement(By.xpath("//input[@placeholder='John Doe']")).sendKeys(name);
        Thread.sleep(400);

        driver.findElement(By.xpath("(//input[@name='dependents'])[1]")).sendKeys(dependents);
        Thread.sleep(400);

        new Select(driver.findElement(By.xpath("//select[.//option[@value='Graduate']]")))
                .selectByValue(education);
        Thread.sleep(400);

        new Select(driver.findElement(By.xpath("//select[.//option[@value='true']]")))
                .selectByValue(selfEmployed);
        Thread.sleep(400);

        driver.findElement(By.xpath("(//input[@name='incomeAnnum'])[1]")).sendKeys(income);
        Thread.sleep(300);

        driver.findElement(By.xpath("(//input[@name='loanAmount'])[1]")).sendKeys(loanAmount);
        Thread.sleep(300);

        driver.findElement(By.xpath("(//input[@name='loanTerm'])[1]")).sendKeys(loanTerm);
        Thread.sleep(300);

        driver.findElement(By.xpath("(//input[@name='cibilScore'])[1]")).sendKeys(cibilScore);
        Thread.sleep(300);

        driver.findElement(By.xpath("(//input[@name='resedentialAssetValue'])[1]")).sendKeys(resiAsset);
        driver.findElement(By.xpath("(//input[@name='commercialAssetValue'])[1]")).sendKeys(commAsset);
        driver.findElement(By.xpath("(//input[@name='luxuryAssetValue'])[1]")).sendKeys(luxAsset);
        driver.findElement(By.xpath("(//input[@name='bankAssetValue'])[1]")).sendKeys(bankAsset);
        driver.findElement(By.xpath("(//input[@name='debt'])[1]")).sendKeys(debt);

        Thread.sleep(800); // 👈 pause before submit

        // Scroll and submit
        ((JavascriptExecutor) driver)
                .executeScript("window.scrollTo(0, document.body.scrollHeight)");

        WebElement submitBtn = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[normalize-space()='Submit Application']")));

        Thread.sleep(800); // 👈 see button before click
        submitBtn.click();

        // Wait for redirect
        wait.until(ExpectedConditions.urlContains("/dashboard"));
        Thread.sleep(1500); // 👈 see result page

        Assert.assertTrue(driver.getCurrentUrl().contains("/dashboard"),
                "Loan submission should redirect to dashboard");

        System.out.println("PASSED | applyLoanTest | Case: " + caseLabel);
    }

    @AfterMethod
    public void tearDown() {
        driver.quit();
    }
}