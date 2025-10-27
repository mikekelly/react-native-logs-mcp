# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [Unreleased]

### 🎯 Token-Efficiency Improvements (mikekelly fork)

#### Changed

-   **Plain Text Output**: Console logs are now returned as plain text (one per line) instead of verbose JSON, reducing token usage by ~98%
-   **Conditional Stack Traces**: Stack traces and raw arguments are only included for error and warning level logs, not for regular logs
-   **Simplified Error Format**: Errors show ❌ ERROR: prefix with just the top stack frame for context

#### Technical Details

-   Modified `readConsoleLogsFromApp` handler to format logs as plain text
-   Updated log collection to conditionally include `args` and `stackTrace` only for errors/warnings
-   Reduced context consumption from ~2500 tokens to ~50 tokens for 3 typical log messages

#### Why These Changes?

AI agents operating with these logs consume tokens for every character. The original JSON format with full stack traces for every log level was extremely verbose and wasteful. This fork maintains all the debugging value while being dramatically more efficient for AI context.

### 🚀 Enhanced Console Log Functionality

#### Added

-   **Complete Multi-line Log Support**: Console logs now capture full multi-line strings, template literals, and formatted text without truncation
-   **Rich Object Formatting**: Objects are now displayed with their complete structure instead of `[object Object]`
-   **Enhanced Array Display**: Arrays show all elements with proper type representation
-   **Complex Data Structure Support**: Maps, Sets, Dates, RegExp, and other complex types are properly formatted
-   **Full Error Information**: Error objects now include complete stack traces and error details
-   **Chrome DevTools Protocol Integration**: Leverages CDP's `RemoteObject.description` field for accurate formatting

#### Technical Improvements

-   Added `formatConsoleArgument()` function that handles all JavaScript value types
-   Enhanced `ConsoleMessage` interface with raw arguments and stack trace support
-   Implemented proper type definitions for Chrome DevTools Protocol objects
-   Added comprehensive unit tests for argument formatting edge cases

#### Breaking Changes

-   None - fully backward compatible

#### Migration Guide

-   No migration required - existing functionality is preserved and enhanced
-   All existing console logs will automatically show more complete information

### 📋 Testing & Documentation

-   Added comprehensive test suite for console argument formatting
-   Created detailed testing guide with real React Native app examples
-   Enhanced README with feature descriptions and usage examples
-   Added troubleshooting guide for common issues

## 1.0.0 (2025-03-28)
