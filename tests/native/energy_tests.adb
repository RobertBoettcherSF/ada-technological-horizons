with Ada.Command_Line;
with Ada.Text_IO;
with Ath_Energy;

procedure Energy_Tests is
   Failures : Natural := 0;

   procedure Fail (Name : String) is
   begin
      Failures := Failures + 1;
      Ada.Text_IO.Put_Line ("FAIL " & Name);
   end Fail;
begin
   if abs (Ath_Energy.Third_Factor (2_500.0) - 4_103.0063155) > 0.01 then
      Fail ("third-factor");
   end if;
   if abs (Ath_Energy.Stated_Rate - 9.252886076685e-3) > 1.0e-12 then
      Fail ("stated-rate");
   end if;
   if abs (Ath_Energy.Stated_Factor (2_500.0) - 1.0e10) / 1.0e10 > 1.0e-9 then
      Fail ("stated-factor");
   end if;
   if abs (Ath_Energy.Sun_Share (2_500.0) - 1.0e-4) / 1.0e-4 > 1.0e-9 then
      Fail ("sun-share");
   end if;
   if abs (Ath_Energy.Today_Erg - 4.0e19) / 4.0e19 > 1.0e-9 then
      Fail ("today");
   end if;
   if Ath_Energy.Kardashev_II /= Ath_Energy.Sun_Erg then
      Fail ("sun-matches-type-two");
   end if;
   if abs (Ath_Energy.Modern_Sun_Erg - 3.8e33) / 3.8e33 > 1.0e-9 then
      Fail ("modern-sun");
   end if;
   if Ath_Energy.Visible_Stars /= 1.0e21 then
      Fail ("stars");
   end if;
   if Ath_Energy.Third_Factor (0.0) /= 1.0 or else Ath_Energy.Stated_Factor (0.0) /= 1.0 then
      Fail ("year-zero");
   end if;

   if Failures = 0 then
      Ada.Text_IO.Put_Line ("ENERGY OK");
   else
      Ada.Command_Line.Set_Exit_Status (Ada.Command_Line.Failure);
   end if;
end Energy_Tests;
