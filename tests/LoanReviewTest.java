package com.rinflow.tests;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.*;

import java.util.List;

public class LoanReviewTest {

    WebDriver driver;

    private void loginAsOfficer() throws InterruptedException {
        driver.get("http://localhost:5173/login");
        Thread.sleep(2000);

        driver.findElement(By.xpath("//input[@placeholder='you@example.com']"))
                .sendKeys("admin@gmail.com");

        driver.findElement(By.xpath("//input[@placeholder='••••••••']"))
                .sendKeys("Admin@12");

        driver.findElement(By.xpath("//button[normalize-space()='Sign in']")).click();
        Thread.sleep(3000);
    }

    @BeforeMethod
    public void setup() throws InterruptedException {
        WebDriverManager.chromedriver().setup();
        driver = new ChromeDriver();
        driver.manage().window().maximize();
        driver.get("http://localhost:5173/");
        Thread.sleep(2000);
    }

    // 🔧 Helper: apply status filter
    private void applyStatusFilter(String status) throws InterruptedException {
        WebElement statusDropdown = driver.findElement(
                By.xpath("//select[.//option[normalize-space()='All Statuses']]")
        );

        new Select(statusDropdown).selectByVisibleText(status);
        Thread.sleep(1500); // allow UI update

        System.out.println("Filter applied: " + status);
    }

    // 🔧 Helper: open first visible loan
    private boolean openFirstLoan() throws InterruptedException {
        List<WebElement> reviewButtons = driver.findElements(
                By.xpath("//button[normalize-space()='Review Application']")
        );

        if (reviewButtons.isEmpty()) {
            System.out.println("INFO | No loans found after filtering");
            return false;
        }

        reviewButtons.get(0).click();
        Thread.sleep(2000);
        return true;
    }

    // ✅ ACCEPT TEST (Pending)
    @Test
    public void acceptLoanTest() throws InterruptedException {
        loginAsOfficer();

        applyStatusFilter("Pending");

        Assert.assertTrue(openFirstLoan(),
                "No Pending loans available");

        driver.findElement(By.xpath("//button[normalize-space()='Accept Loan']")).click();
        Thread.sleep(3000);

        Assert.assertTrue(driver.getCurrentUrl().contains("/dashboard"));

        System.out.println("PASSED | acceptLoanTest");
    }

    // ✅ REJECT TEST (Pending)
    @Test
    public void rejectLoanTest() throws InterruptedException {
        loginAsOfficer();

        applyStatusFilter("Pending");

        Assert.assertTrue(openFirstLoan(),
                "No Pending loans available");

        driver.findElement(By.xpath("//button[normalize-space()='Reject Loan']")).click();
        Thread.sleep(3000);

        Assert.assertTrue(driver.getCurrentUrl().contains("/dashboard"));

        System.out.println("PASSED | rejectLoanTest");
    }

    // ✅ RESET TEST (Approved → fallback Rejected)
    @Test
    public void resetLoanTest() throws InterruptedException {
        loginAsOfficer();

        applyStatusFilter("Approved");

        boolean opened = openFirstLoan();

        if (!opened) {
            System.out.println("No Approved loans, trying Rejected...");
            applyStatusFilter("Rejected");
            opened = openFirstLoan();
        }

        if (!opened) {
            System.out.println("SKIPPED | No Approved/Rejected loans found");
            return;
        }

        WebElement resetBtn = driver.findElement(
                By.xpath("//button[normalize-space()='Reset to Pending']")
        );

        Assert.assertTrue(resetBtn.isDisplayed());

        resetBtn.click();
        Thread.sleep(3000);

        Assert.assertTrue(driver.getCurrentUrl().contains("/dashboard"));

        System.out.println("PASSED | resetLoanTest");
    }

    @AfterMethod
    public void tearDown() {
        driver.quit();
    }
}