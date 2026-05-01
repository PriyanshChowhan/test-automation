	package com.rinflow.tests;
	
	import io.github.bonigarcia.wdm.WebDriverManager;
	import org.openqa.selenium.By;
	import org.openqa.selenium.WebDriver;
	import org.openqa.selenium.WebElement;
	import org.openqa.selenium.chrome.ChromeDriver;
	import org.openqa.selenium.support.ui.Select;
	import org.testng.Assert;
	import org.testng.annotations.*;
	
	public class DashboardTest {
	
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
	
	    // ✅ 1. SEARCH
	    @Test
	    public void officerSearchTest() throws InterruptedException {
	        loginAsOfficer();
	
	        WebElement searchInput = driver.findElement(
	                By.xpath("//input[contains(@placeholder,'Search by Loan ID')]"));
	
	        searchInput.sendKeys("69f1dea4e497eeff137272e8");
	        Thread.sleep(1500);
	
	        WebElement resultText = driver.findElement(
	                By.xpath("//*[contains(text(),'Showing')]"));
	
	        Assert.assertTrue(resultText.isDisplayed());
	        Assert.assertTrue(resultText.getText().startsWith("Showing"));
	
	        System.out.println("PASSED | officerSearchTest | Result: " + resultText.getText());
	    }
	
	    // ✅ 2. STATUS FILTER
	    @Test
	    public void statusFilterTest() throws InterruptedException {
	        loginAsOfficer();
	
	        WebElement statusSelect = driver.findElement(
	                By.xpath("//select[.//option[normalize-space()='All Statuses']]"));
	
	        new Select(statusSelect).selectByVisibleText("Pending");
	        Thread.sleep(1000);
	
	        Assert.assertTrue(driver.getCurrentUrl().contains("/dashboard"));
	
	        System.out.println("PASSED | statusFilterTest");
	    }
	
	    // ✅ 3. AMOUNT FILTER
	    @Test
	    public void officerAmountRangeFilterTest() throws InterruptedException {
	        loginAsOfficer();
	
	        driver.findElement(By.xpath("//input[@placeholder='Min (₹)']")).sendKeys("100000");
	        driver.findElement(By.xpath("//input[@placeholder='Max (₹)']")).sendKeys("1000000");
	        Thread.sleep(1500);
	
	        WebElement resultText = driver.findElement(
	                By.xpath("//*[contains(text(),'Showing')]"));
	
	        Assert.assertTrue(resultText.isDisplayed());
	
	        System.out.println("PASSED | officerAmountRangeFilterTest | Result: " + resultText.getText());
	    }
	
	    // ✅ 5. SORTING (ALL OPTIONS)
	    @Test
	    public void sortOptionsTest() throws InterruptedException {
	        loginAsOfficer();
	
	        String[] options = {
	                "Newest First",
	                "Oldest First",
	                "Amount: High → Low",
	                "Amount: Low → High",
	                "CIBIL: High → Low",
	                "CIBIL: Low → High"
	        };
	
	        WebElement sortSelect = driver.findElement(
	                By.xpath("//select[.//option[normalize-space()='Newest First']]"));
	
	        Select select = new Select(sortSelect);
	
	        for (String option : options) {
	            select.selectByVisibleText(option);
	            Thread.sleep(1000);
	
	            Assert.assertTrue(driver.getCurrentUrl().contains("/dashboard"));
	
	            System.out.println("PASSED | sortOptionsTest | Case: " + option);
	        }
	    }
	    
	    @AfterMethod
	    public void tearDown() {
	        driver.quit();
	    }
	}