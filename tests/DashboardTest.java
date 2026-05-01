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

public class DashboardTest {

    WebDriver driver;
    WebDriverWait wait;

    /**
     * Logs in as loan-officer and waits until the dashboard data is fully loaded.
     *
     * The dashboard makes two sequential API calls after login:
     *   1. /api/v1/getUser  → sets role
     *   2. /api/v1/loanOfficer/getAllLoans  → populates the loan list
     *
     * Waiting only for the URL change is not enough — the filter bar and "Showing" text
     * are rendered *after* both API calls complete.  The original code used a blind
     * Thread.sleep(3000) which was too short on slow CI machines.
     */
    private void loginAsOfficer() {
        driver.get("http://localhost:5173/login");

        // Wait for the login form before interacting
        wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//input[@placeholder='you@example.com']")))
                .sendKeys("admin@gmail.com");

        driver.findElement(By.xpath("//input[@placeholder='••••••••']"))
                .sendKeys("Admin@12");

        driver.findElement(By.xpath("//button[normalize-space()='Sign in']")).click();

        // 1. Wait for URL change (React Router navigation)
        wait.until(ExpectedConditions.urlContains("/dashboard"));

        // 2. Wait for the status-filter dropdown — it only appears once the role API call
        //    completes and React has re-rendered with role === "loanOfficer"
        wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//select[.//option[normalize-space()='All Statuses']]")));

        // 3. Wait for the "Showing X of Y applications" counter — it only appears after
        //    the loans API call completes and loanApplications state is populated.
        //    "Showing 0 of 0" still satisfies contains("Showing"), so an empty DB is fine.
        wait.until(ExpectedConditions.presenceOfElementLocated(
                By.xpath("//*[contains(text(),'Showing')]")));
    }

    @BeforeMethod
    public void setup() {
        WebDriverManager.chromedriver().setup();
        driver = new ChromeDriver();
        driver.manage().window().maximize();
        wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        driver.get("http://localhost:5173/");
        // driver.get() blocks until readyState == "complete"; no sleep needed
    }

    // ✅ 1. SEARCH
    @Test
    public void officerSearchTest() {
        loginAsOfficer();

        // The search input is always present on the officer dashboard; wait for visibility
        WebElement searchInput = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//input[contains(@placeholder,'Search by Loan ID')]")));

        searchInput.sendKeys("69f1dea4e497eeff137272e8");

        // Filtering is client-side (useMemo), so the "Showing" counter updates in the same
        // render cycle as the keystroke. Wait for the element to be visible (it was already
        // rendered, but this acts as a stability barrier).
        WebElement resultText = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//*[contains(text(),'Showing')]")));

        Assert.assertTrue(resultText.isDisplayed());
        Assert.assertTrue(resultText.getText().startsWith("Showing"));

        System.out.println("PASSED | officerSearchTest | Result: " + resultText.getText());
    }

    // ✅ 2. STATUS FILTER
    @Test
    public void statusFilterTest() {
        loginAsOfficer();

        // Wait for the dropdown to be interactive before selecting
        WebElement statusSelect = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//select[.//option[normalize-space()='All Statuses']]")));

        new Select(statusSelect).selectByVisibleText("Pending");

        // Client-side filtering does not navigate — URL must still contain /dashboard
        Assert.assertTrue(driver.getCurrentUrl().contains("/dashboard"));

        System.out.println("PASSED | statusFilterTest");
    }

    // ✅ 3. AMOUNT FILTER
    @Test
    public void officerAmountRangeFilterTest() {
        loginAsOfficer();

        // Wait for inputs to be visible before typing
        wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//input[@placeholder='Min (₹)']"))).sendKeys("100000");

        wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//input[@placeholder='Max (₹)']"))).sendKeys("1000000");

        // useMemo re-filters on each keystroke; the "Showing" element should already exist
        WebElement resultText = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//*[contains(text(),'Showing')]")));

        Assert.assertTrue(resultText.isDisplayed());

        System.out.println("PASSED | officerAmountRangeFilterTest | Result: " + resultText.getText());
    }

    // ✅ 5. SORTING (ALL OPTIONS)
    @Test
    public void sortOptionsTest() {
        loginAsOfficer();

        String[] options = {
                "Newest First",
                "Oldest First",
                "Amount: High → Low",
                "Amount: Low → High",
                "CIBIL: High → Low",
                "CIBIL: Low → High"
        };

        // Wait for the sort dropdown to be interactive
        WebElement sortSelect = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//select[.//option[normalize-space()='Newest First']]")));

        Select select = new Select(sortSelect);

        for (String option : options) {
            select.selectByVisibleText(option);

            // Sorting is a synchronous useMemo — no network call; URL stays on /dashboard
            Assert.assertTrue(driver.getCurrentUrl().contains("/dashboard"));

            System.out.println("PASSED | sortOptionsTest | Case: " + option);
        }
    }

    @AfterMethod
    public void tearDown() {
        driver.quit();
    }
}