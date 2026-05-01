package com.rinflow.tests;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.*;

import java.time.Duration;
import java.util.List;

public class LoanReviewTest {

    WebDriver driver;
    // Increased to 30 s to account for the getLoanById endpoint optionally calling
    // the Gemini AI API when ai_analysis is missing — that retry can take 10-20 s.
    WebDriverWait wait;

    /**
     * Logs in as loan-officer and blocks until the loan list is fully loaded.
     *
     * Two sequential API calls happen after login:
     *   getUser → sets role → getAllLoans populates loanApplications
     * The original Thread.sleep(3000) was sometimes too short for this chain.
     */
    private void loginAsOfficer() {
        driver.get("http://localhost:5173/login");

        wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//input[@placeholder='you@example.com']")))
                .sendKeys("admin@gmail.com");

        driver.findElement(By.xpath("//input[@placeholder='••••••••']"))
                .sendKeys("Admin@12");

        driver.findElement(By.xpath("//button[normalize-space()='Sign in']")).click();

        // 1. URL navigation
        wait.until(ExpectedConditions.urlContains("/dashboard"));

        // 2. Status-filter visible → role API call completed, component re-rendered
        wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//select[.//option[normalize-space()='All Statuses']]")));

        // 3. "Showing X of Y" present → loans API call completed
        //    (contains "Showing 0 of 0" even when DB is empty, so this is always reachable)
        wait.until(ExpectedConditions.presenceOfElementLocated(
                By.xpath("//*[contains(text(),'Showing')]")));
    }

    @BeforeMethod
    public void setup() {
        WebDriverManager.chromedriver().setup();
        driver = new ChromeDriver();
        driver.manage().window().maximize();
        wait = new WebDriverWait(driver, Duration.ofSeconds(30));
        driver.get("http://localhost:5173/");
    }

    // 🔧 Helper: apply status filter and wait for the list to re-render
    private void applyStatusFilter(String status) {
        WebElement statusDropdown = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//select[.//option[normalize-space()='All Statuses']]")));

        new Select(statusDropdown).selectByVisibleText(status);

        // React re-renders synchronously for client-side useMemo filtering.
        // A short fixed pause is the pragmatic guard against the browser's rendering
        // pipeline catching up after the DOM event — WebDriverWait has nothing to
        // "wait for" here because the element count change is not deterministic.
        try { Thread.sleep(500); } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        System.out.println("Filter applied: " + status);
    }

    // 🔧 Helper: open the first visible loan and wait for the detail page to load
    private boolean openFirstLoan() {
        List<WebElement> reviewButtons = driver.findElements(
                By.xpath("//button[normalize-space()='Review Application']"));

        if (reviewButtons.isEmpty()) {
            System.out.println("INFO | No loans found after filtering");
            return false;
        }

        reviewButtons.get(0).click();

        // Wait for the loan-detail URL — the original Thread.sleep(2000) was sometimes
        // too short when the getLoanById endpoint had to retry the Gemini AI call.
        wait.until(ExpectedConditions.urlContains("/loan/"));

        return true;
    }

    // ✅ ACCEPT TEST (Pending)
    @Test
    public void acceptLoanTest() {
        loginAsOfficer();

        applyStatusFilter("Pending");

        Assert.assertTrue(openFirstLoan(),
                "No Pending loans available");

        // Wait for the loan-detail page content to render before clicking
        // (the backend may call Gemini AI on first view, adding latency)
        wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[normalize-space()='Accept Loan']"))).click();

        // Wait for the redirect back to dashboard instead of sleeping 3 s
        wait.until(ExpectedConditions.urlContains("/dashboard"));

        Assert.assertTrue(driver.getCurrentUrl().contains("/dashboard"));

        System.out.println("PASSED | acceptLoanTest");
    }

    // ✅ REJECT TEST (Pending)
    //
    // Interdependence note: acceptLoanTest and rejectLoanTest both consume one
    // "Pending" loan each time they run.  With the seed data providing 5 pending
    // loans this is not an issue for normal runs, but if the DB has very few pending
    // loans the second test may find none.  Tests are kept independent via
    // @BeforeMethod (fresh driver + fresh login), so they do not share in-memory
    // state — only the DB is shared, which is expected for integration-style tests.
    @Test
    public void rejectLoanTest() {
        loginAsOfficer();

        applyStatusFilter("Pending");

        Assert.assertTrue(openFirstLoan(),
                "No Pending loans available");

        wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[normalize-space()='Reject Loan']"))).click();

        wait.until(ExpectedConditions.urlContains("/dashboard"));

        Assert.assertTrue(driver.getCurrentUrl().contains("/dashboard"));

        System.out.println("PASSED | rejectLoanTest");
    }

    // ✅ RESET TEST (Approved → fallback Rejected)
    @Test
    public void resetLoanTest() {
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

        WebElement resetBtn = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[normalize-space()='Reset to Pending']")));

        Assert.assertTrue(resetBtn.isDisplayed());

        resetBtn.click();

        wait.until(ExpectedConditions.urlContains("/dashboard"));

        Assert.assertTrue(driver.getCurrentUrl().contains("/dashboard"));

        System.out.println("PASSED | resetLoanTest");
    }

    @AfterMethod
    public void tearDown() {
        driver.quit();
    }
}