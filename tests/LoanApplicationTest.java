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

    /**
     * Logs in as an applicant and waits for the dashboard to be fully loaded
     * before returning — prevents the test body from interacting with elements
     * that haven't rendered yet.
     */
    private void loginAsApplicant() {
        driver.get("http://localhost:5173/login");

        // Wait for the form before interacting (replaces blind Thread.sleep)
        WebElement email = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//input[@placeholder='you@example.com']")));
        email.sendKeys("user@gmail.com");

        wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//input[@placeholder='••••••••']"))).sendKeys("User@123");

        wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[normalize-space()='Sign in']"))).click();

        // Wait for the actual URL change rather than sleeping a fixed duration
        wait.until(ExpectedConditions.urlContains("/dashboard"));

        // Wait for the "Apply for New Loan" button — it only renders after the getUser
        // API call completes and role is set to "applicant"
        wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//button[contains(text(),'Apply for New Loan')]")));
    }

    @BeforeMethod
    public void setup() {
        WebDriverManager.chromedriver().setup();
        driver = new ChromeDriver();
        driver.manage().window().maximize();
        wait = new WebDriverWait(driver, Duration.ofSeconds(15));
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

        // Click Apply button — wait for it to be clickable (not just visible)
        WebElement applyBtn = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(text(),'Apply for New Loan')]")));

        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView(true);", applyBtn);
        applyBtn.click();

        // Wait for navigation to the application form
        wait.until(ExpectedConditions.or(
                ExpectedConditions.urlContains("/applicationform"),
                ExpectedConditions.visibilityOfElementLocated(
                        By.xpath("//input[@placeholder='John Doe']"))
        ));

        String currentUrl = driver.getCurrentUrl();
        System.out.println("DEBUG URL: " + currentUrl);

        Assert.assertTrue(currentUrl.contains("application"),
                "Should navigate to application form | URL: " + currentUrl);

        // Fill form — wait for each field to be visible before sending keys
        wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//input[@placeholder='John Doe']"))).sendKeys(name);

        wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("(//input[@name='dependents'])[1]"))).sendKeys(dependents);

        new Select(wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//select[.//option[@value='Graduate']]")))).selectByValue(education);

        new Select(wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//select[.//option[@value='true']]")))).selectByValue(selfEmployed);

        wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("(//input[@name='incomeAnnum'])[1]"))).sendKeys(income);

        wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("(//input[@name='loanAmount'])[1]"))).sendKeys(loanAmount);

        wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("(//input[@name='loanTerm'])[1]"))).sendKeys(loanTerm);

        wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("(//input[@name='cibilScore'])[1]"))).sendKeys(cibilScore);

        driver.findElement(By.xpath("(//input[@name='resedentialAssetValue'])[1]")).sendKeys(resiAsset);
        driver.findElement(By.xpath("(//input[@name='commercialAssetValue'])[1]")).sendKeys(commAsset);
        driver.findElement(By.xpath("(//input[@name='luxuryAssetValue'])[1]")).sendKeys(luxAsset);
        driver.findElement(By.xpath("(//input[@name='bankAssetValue'])[1]")).sendKeys(bankAsset);
        driver.findElement(By.xpath("(//input[@name='debt'])[1]")).sendKeys(debt);

        // Scroll to the submit button and wait for it to be clickable
        ((JavascriptExecutor) driver)
                .executeScript("window.scrollTo(0, document.body.scrollHeight)");

        WebElement submitBtn = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[normalize-space()='Submit Application']")));

        submitBtn.click();

        // Wait for the POST /applicant/apply to complete and React to navigate back to
        // dashboard — the backend responds quickly (Gemini runs in the background).
        wait.until(ExpectedConditions.urlContains("/dashboard"));

        Assert.assertTrue(driver.getCurrentUrl().contains("/dashboard"),
                "Loan submission should redirect to dashboard");

        System.out.println("PASSED | applyLoanTest | Case: " + caseLabel);
    }

    @AfterMethod
    public void tearDown() {
        driver.quit();
    }
}