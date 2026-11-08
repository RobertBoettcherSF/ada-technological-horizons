with Ada.Command_Line;
with Ada.Text_IO;
with Ada.Unchecked_Conversion;
with Interfaces;
with Ath_Throughput;
with Ath_Throughput_Exports;

procedure Throughput_Tests is
   use type Interfaces.Integer_32;
   use type Ath_Throughput.Status_Code;

   type Bits is mod 2 ** 64;
   function To_Bits is new Ada.Unchecked_Conversion (Long_Float, Bits);
   function To_Float is new Ada.Unchecked_Conversion (Bits, Long_Float);

   Failures : Natural := 0;

   function Hex (Value : Bits) return String is
      Alphabet : constant String := "0123456789abcdef";
      Image    : String (1 .. 16) := (others => '0');
      Rest     : Bits := Value;
   begin
      for Index in reverse Image'Range loop
         Image (Index) := Alphabet (Natural (Rest mod 16) + 1);
         Rest := Rest / 16;
      end loop;
      return Image;
   end Hex;

   function Flag (Value : Boolean) return Interfaces.Integer_32 is
   begin
      if Value then
         return 1;
      end if;
      return 0;
   end Flag;

   procedure Fail (Name : String) is
   begin
      Failures := Failures + 1;
      Ada.Text_IO.Put_Line ("FAIL " & Name);
   end Fail;

   procedure Emit
     (Name : String;
      Quantity, Quantity_Unit, Rate, Rate_Unit, Bound, Duration, Duration_Unit : Long_Float;
      Time_Seconds, Total_Bits, Human_Seconds, Bacterial_Seconds, Rate_Ratio : Long_Float;
      Time_Valid, Total_Valid, Chart_Valid : Boolean;
      Status : Ath_Throughput.Status_Code) is
   begin
      Ada.Text_IO.Put_Line
        ("THROUGHPUT " & Name &
         Interfaces.Integer_32'Image (Interfaces.Integer_32 (Status)) &
         Interfaces.Integer_32'Image (Flag (Time_Valid)) &
         Interfaces.Integer_32'Image (Flag (Total_Valid)) &
         Interfaces.Integer_32'Image (Flag (Chart_Valid)) &
         " " & Hex (To_Bits (Time_Seconds)) &
         " " & Hex (To_Bits (Total_Bits)) &
         " " & Hex (To_Bits (Human_Seconds)) &
         " " & Hex (To_Bits (Bacterial_Seconds)) &
         " " & Hex (To_Bits (Rate_Ratio)) &
         " " & Hex (To_Bits (Quantity)) &
         " " & Hex (To_Bits (Quantity_Unit)) &
         " " & Hex (To_Bits (Rate)) &
         " " & Hex (To_Bits (Rate_Unit)) &
         " " & Hex (To_Bits (Bound)) &
         " " & Hex (To_Bits (Duration)) &
         " " & Hex (To_Bits (Duration_Unit)));
   end Emit;

   procedure Run
     (Name : String;
      Quantity, Quantity_Unit, Rate, Rate_Unit, Bound, Duration, Duration_Unit : Long_Float;
      Expected : Ath_Throughput.Status_Code;
      Expected_Time : Long_Float := 0.0;
      Expected_Total : Long_Float := 0.0;
      Expected_Human : Long_Float := 0.0;
      Expected_Bacterial : Long_Float := 0.0;
      Expected_Ratio : Long_Float := 0.0;
      Expect_Time, Expect_Total, Expect_Chart : Boolean := False;
      Expect_Upper : Boolean := False;
      Expect_Lower : Boolean := False)
   is
      Time_Seconds, Total_Bits, Quantity_Bits, Rate_Bits : Long_Float;
      Human_Seconds, Bacterial_Seconds, Rate_Ratio : Long_Float;
      Time_Valid, Total_Valid, Chart_Valid, Time_Is_Upper, Total_Is_Lower : Boolean;
      Status : Ath_Throughput.Status_Code;
   begin
      Ath_Throughput.Convey
        (Quantity, Quantity_Unit, Rate, Rate_Unit, Bound, Duration, Duration_Unit,
         Time_Seconds, Total_Bits, Quantity_Bits, Rate_Bits,
         Human_Seconds, Bacterial_Seconds, Rate_Ratio,
         Time_Valid, Total_Valid, Chart_Valid, Time_Is_Upper, Total_Is_Lower, Status);
      if Status /= Expected then
         Fail (Name & " status");
      end if;
      if Time_Valid /= Expect_Time or else Total_Valid /= Expect_Total
        or else Chart_Valid /= Expect_Chart
      then
         Fail (Name & " flags");
      end if;
      if Expect_Time and then Time_Seconds /= Expected_Time then
         Fail (Name & " time");
      end if;
      if Expect_Total and then Total_Bits /= Expected_Total then
         Fail (Name & " total");
      end if;
      if Expect_Chart then
         if Human_Seconds /= Expected_Human
           or else Bacterial_Seconds /= Expected_Bacterial
           or else Rate_Ratio /= Expected_Ratio
         then
            Fail (Name & " chart");
         end if;
      elsif Time_Seconds /= 0.0 or else Total_Bits /= 0.0 or else Human_Seconds /= 0.0 then
         Fail (Name & " cleared");
      end if;
      if Time_Is_Upper /= Expect_Upper or else Total_Is_Lower /= Expect_Lower then
         Fail (Name & " bound");
      end if;
      Emit
        (Name, Quantity, Quantity_Unit, Rate, Rate_Unit, Bound, Duration, Duration_Unit,
         Time_Seconds, Total_Bits, Human_Seconds, Bacterial_Seconds, Rate_Ratio,
         Time_Valid, Total_Valid, Chart_Valid, Status);
   end Run;
begin
   Run
     ("page-at-human", 10_000.0, 0.0, 25.0, 0.0, 0.0, 400.0, 0.0,
      Ath_Throughput.Ok, 400.0, 10_000.0, 400.0, 10.0, 40.0,
      True, True, True, False, False);
   Run
     ("one-page-unit", 1.0, 2.0, 25.0, 0.0, 0.0, 400.0, 0.0,
      Ath_Throughput.Ok, 400.0, 10_000.0, 400.0, 10.0, 40.0,
      True, True, True, False, False);
   Run
     ("bits-per-minute", 10_000.0, 0.0, 1_500.0, 1.0, 0.0, 400.0, 0.0,
      Ath_Throughput.Ok, 400.0, 10_000.0, 400.0, 10.0, 40.0,
      True, True, True, False, False);
   Run
     ("one-kilobit-per-second", 10_000.0, 0.0, 1.0, 2.0, 0.0, 10.0, 0.0,
      Ath_Throughput.Ok, 10.0, 10_000.0, 400.0, 10.0, 40.0,
      True, True, True, False, False);
   Run
     ("one-minute", 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0,
      Ath_Throughput.Ok, 0.0, 60.0, 0.0, 0.0, 40.0,
      True, True, True, False, False);
   Run
     ("bacterial-bound", 10_000.0, 0.0, 1_000.0, 0.0, 1.0, 400.0, 0.0,
      Ath_Throughput.Ok, 10.0, 400_000.0, 400.0, 10.0, 40.0,
      True, True, True, True, True);
   Run
     ("zero-rate", 10_000.0, 0.0, 0.0, 0.0, 0.0, 400.0, 0.0,
      Ath_Throughput.Unreachable, 0.0, 0.0, 400.0, 10.0, 40.0,
      False, True, True, False, False);
   Run
     ("zero-over-zero", 0.0, 0.0, 0.0, 0.0, 0.0, 5.0, 0.0,
      Ath_Throughput.Indeterminate, 0.0, 0.0, 0.0, 0.0, 40.0,
      False, True, True, False, False);
   Run
     ("negative-rate", 10_000.0, 0.0, -1.0, 0.0, 0.0, 1.0, 0.0,
      Ath_Throughput.Negative);
   Run
     ("empty-nan", 10_000.0, 0.0, To_Float (16#7FF8_0000_0000_0001#), 0.0, 0.0, 1.0, 0.0,
      Ath_Throughput.Non_Finite_Input);
   Run
     ("bad-unit", 1.0, 9.0, 1.0, 0.0, 0.0, 1.0, 0.0,
      Ath_Throughput.Bad_Unit);
   Run
     ("overflow-time", Long_Float'Last, 0.0, 0.5, 0.0, 0.0, 1.0, 0.0,
      Ath_Throughput.Result_Not_Finite);
   Run
     ("one-hour", 3_600.0, 0.0, 1.0, 0.0, 0.0, 1.0, 2.0,
      Ath_Throughput.Ok, 3_600.0, 3_600.0, 144.0, 3_600.0 / 1_000.0, 40.0,
      True, True, True, False, False);

   if Ath_Throughput.Preset_Quantity (1) /= 1.0
     or else Ath_Throughput.Preset_Quantity_Unit (1) /= 2.0
     or else not Ath_Throughput.Preset_Sets_Quantity (1)
     or else Ath_Throughput.Preset_Sets_Rate (1)
   then
      Fail ("preset-page");
   end if;
   if Ath_Throughput.Preset_Rate (2) /= 25.0
     or else Ath_Throughput.Preset_Bound (2) /= 0.0
     or else not Ath_Throughput.Preset_Sets_Rate (2)
   then
      Fail ("preset-human");
   end if;
   if Ath_Throughput.Preset_Rate (3) /= 1_000.0
     or else Ath_Throughput.Preset_Bound (3) /= 1.0
   then
      Fail ("preset-bacterial");
   end if;
   if Ath_Throughput.Preset_Rate (4) /= 1.0
     or else Ath_Throughput.Preset_Rate_Unit (4) /= 3.0
     or else Ath_Throughput.Preset_Bound (4) /= 0.0
     or else not Ath_Throughput.Preset_Sets_Rate (4)
   then
      Fail ("preset-link");
   end if;
   if Ath_Throughput.Linear_Share (Ath_Throughput.Bacterial_Bits_Per_Second) /= 1.0
     or else Ath_Throughput.Linear_Share (Ath_Throughput.Human_Bits_Per_Second)
       /= Ath_Throughput.Human_Bits_Per_Second / Ath_Throughput.Bacterial_Bits_Per_Second
     or else Ath_Throughput.Logarithmic_Share (Ath_Throughput.Link_Bits_Per_Second) /= 1.0
   then
      Fail ("shares");
   end if;
   declare
      Link_Time : Long_Float;
      Link_Valid : Boolean;
   begin
      Ath_Throughput.Reference_Seconds
        (10_000.0, Ath_Throughput.Link_Bits_Per_Second, Link_Time, Link_Valid);
      if not Link_Valid
        or else Link_Time /= 10_000.0 / Ath_Throughput.Link_Bits_Per_Second
      then
         Fail ("link-time");
      end if;
   end;
   declare
      Match, Linear_Count, Log_Count : Interfaces.Integer_32;
      Over_Human, Over_Bacterial : Long_Float;
      Ratio_Valid : Boolean;
      Linear_Rows, Log_Rows : Ath_Throughput.Comparison_Table;
   begin
      Ath_Throughput.Build_Comparison
        (Ath_Throughput.Link_Bits_Per_Second, 0.0, 10_000.0,
         Ath_Throughput.Mode_Link,
         Match, Over_Human, Over_Bacterial, Ratio_Valid,
         Linear_Count, Log_Count, Linear_Rows, Log_Rows);
      if Match /= Ath_Throughput.Match_Link
        or else Linear_Count /= 2
        or else Linear_Rows (1).Kind /= Ath_Throughput.Match_Link
        or else Linear_Rows (1).Linear /= 1.0
        or else Linear_Rows (2).Kind /= Ath_Throughput.Match_Human
        or else Linear_Rows (2).Rate /= 25.0
        or else Linear_Rows (2).Linear >= 0.001
        or else not Ratio_Valid
        or else Over_Human /= 40_000_000.0
        or else Over_Bacterial /= 1_000_000.0
      then
         Fail ("link-comparison");
      end if;
      Ath_Throughput.Build_Comparison
        (25.0, 0.0, 10_000.0,
         Ath_Throughput.Mode_Historical,
         Match, Over_Human, Over_Bacterial, Ratio_Valid,
         Linear_Count, Log_Count, Linear_Rows, Log_Rows);
      if Match /= Ath_Throughput.Match_Human
        or else Linear_Count /= 2
        or else Linear_Rows (1).Kind /= Ath_Throughput.Match_Human
        or else Linear_Rows (2).Kind /= Ath_Throughput.Match_Bacterial
        or else Linear_Rows (2).Linear /= 1.0
        or else Log_Count /= 2
      then
         Fail ("human-comparison");
      end if;
      Ath_Throughput.Build_Comparison
        (1_000.0, 1.0, 10_000.0,
         Ath_Throughput.Mode_Bacterial,
         Match, Over_Human, Over_Bacterial, Ratio_Valid,
         Linear_Count, Log_Count, Linear_Rows, Log_Rows);
      if Match /= Ath_Throughput.Match_Bacterial
        or else Linear_Rows (1).Kind /= Ath_Throughput.Match_Bacterial
        or else Linear_Rows (1).Linear /= 1.0
        or else Linear_Rows (2).Kind /= Ath_Throughput.Match_Human
        or else Over_Human /= 40.0
      then
         Fail ("bacterial-comparison");
      end if;
   end;

   declare
      Export_Status : Interfaces.Integer_32;
   begin
      Export_Status := Ath_Throughput_Exports.Ath_Throughput_F64
        (10_000.0, 0.0, 25.0, 0.0, 0.0, 400.0, 0.0);
      if Export_Status /= 0
        or else Ath_Throughput_Exports.Ath_Throughput_Time /= 400.0
        or else Ath_Throughput_Exports.Ath_Throughput_Total /= 10_000.0
        or else Ath_Throughput_Exports.Ath_Throughput_Human /= 400.0
        or else Ath_Throughput_Exports.Ath_Throughput_Bacterial /= 10.0
        or else Ath_Throughput_Exports.Ath_Throughput_Ratio /= 40.0
        or else Ath_Throughput_Exports.Ath_Throughput_Link_Valid /= 1
        or else Ath_Throughput_Exports.Ath_Throughput_Link_Rate /= 1_000_000_000.0
        or else Ath_Throughput_Exports.Ath_Throughput_Bacterial_Linear /= 1.0
        or else Ath_Throughput_Exports.Ath_Throughput_Link_Log /= 1.0
        or else Ath_Throughput_Exports.Ath_Throughput_Link_Time
          /= 10_000.0 / 1_000_000_000.0
      then
         Fail ("export-page");
      end if;
      Export_Status := Ath_Throughput_Exports.Ath_Throughput_F64
        (10_000.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
      if Export_Status /= 5
        or else Ath_Throughput_Exports.Ath_Throughput_Time_Valid /= 0
        or else Ath_Throughput_Exports.Ath_Throughput_Total /= 0.0
        or else Ath_Throughput_Exports.Ath_Throughput_Human /= 400.0
      then
         Fail ("export-unreachable");
      end if;
      Export_Status := Ath_Throughput_Exports.Ath_Throughput_F64
        (1.0, 0.0, -2.0, 0.0, 0.0, 1.0, 0.0);
      if Export_Status /= 2
        or else Ath_Throughput_Exports.Ath_Throughput_Time_Valid /= 0
        or else Ath_Throughput_Exports.Ath_Throughput_Chart_Valid /= 0
        or else Ath_Throughput_Exports.Ath_Throughput_Time /= 0.0
      then
         Fail ("export-cleared");
      end if;
   end;

   if Failures = 0 then
      Ada.Text_IO.Put_Line ("THROUGHPUT OK");
   else
      Ada.Text_IO.Put_Line ("THROUGHPUT FAILURES" & Failures'Image);
      Ada.Command_Line.Set_Exit_Status (Ada.Command_Line.Failure);
   end if;
end Throughput_Tests;
