# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [Unreleased]

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
